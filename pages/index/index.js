const { getAllProducts, deleteProduct, searchProducts, sortProducts, saveAllProducts } = require('../../services/productService')
const { getDefaultCurrency } = require('../../services/currencyService')
const { getAllProductNames, getAllLocations, getAllBrands } = require('../../services/fieldService')

Page({
  data: {
    searchKeyword: '',
    products: [],
    filteredProducts: [],
    showFilter: false,
    touchStartX: 0,
    currentSwipeIndex: -1,
    sortBy: 'dateDesc'
  },

  onLoad() {
    this.loadProducts()
  },

  onShow() {
    this.loadProducts()
  },

  onGenerateTestData() {
    const now = Date.now()
    const commonProducts = ['牛奶', '苹果', '鸡蛋', '大米', '面包']
    const locations = ['Superstore', 'A1超市', '天天超市']
    const brands = ['伊利', '蒙牛', '农夫山泉', '可口可乐', '百事']

    // 清除现有测试数据
    const existingProducts = getAllProducts()
    existingProducts.forEach(product => {
      if (product.id.startsWith('test')) {
        deleteProduct(product.id)
      }
    })

    // 生成新测试数据
    for (let i = 1; i <= 100; i++) {
      const product = {
        id: 'test' + i,
        name: commonProducts[i % commonProducts.length],
        date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        location: locations[i % locations.length],
        brand: brands[i % brands.length],
        originalPrice: parseFloat((Math.random() * 30 + 5).toFixed(2)),
        currentPrice: parseFloat((Math.random() * 30 + 5).toFixed(2)),
        currency: getDefaultCurrency(),
        note: i % 7 === 0 ? '促销活动' : '',
        createTime: now - 86400000 * (100 - i),
        updateTime: now - 86400000 * (100 - i)
      }

      const products = getAllProducts()
      products.push(product)
      saveAllProducts(products)
    }

    this.loadProducts()
    wx.showToast({
      title: '已生成100条测试数据',
      icon: 'success'
    })
  },

  loadProducts() {
    try {
      const products = getAllProducts()
      const productMap = {}

      products.forEach(function (p) {
        if (!productMap[p.name] || Number(p.currentPrice) < Number(productMap[p.name].currentPrice)) {
          productMap[p.name] = p
        }
      })

      const uniqueProducts = Object.values(productMap)
      uniqueProducts.forEach(item => {
        item.swipingLeft = false
        if (!item.currency || !item.currency.symbol) {
          item.currencySymbol = '¥'
        }
      })

      const sortedProducts = this.sortProductsByCurrentSortOption(uniqueProducts)
      this.setData({
        products: sortedProducts,
        filteredProducts: sortedProducts
      })
    } catch (error) {
      console.error('加载商品数据失败:', error)
    }
  },

  sortProductsByCurrentSortOption(products) {
    if (!Array.isArray(products)) {
      console.error('传入的商品列表无效')
      return []
    }

    try {
      let sorted = JSON.parse(JSON.stringify(products))

      // 先按置顶状态分组
      const pinnedProducts = sorted.filter(p => p.isPinned)
      const unpinnedProducts = sorted.filter(p => !p.isPinned)

      // 根据排序选项对每组商品进行排序
      const sortFn = (a, b) => {
        if (this.data.sortBy.includes('price')) {
          const aPrice = Number(a.currentPrice) || 0
          const bPrice = Number(b.currentPrice) || 0
          return this.data.sortBy === 'priceAsc' ? aPrice - bPrice : bPrice - aPrice
        } else {
          const aDate = new Date(a.date).getTime()
          const bDate = new Date(b.date).getTime()
          return this.data.sortBy === 'dateAsc' ? aDate - bDate : bDate - aDate
        }
      }

      pinnedProducts.sort(sortFn)
      unpinnedProducts.sort(sortFn)

      return [...pinnedProducts, ...unpinnedProducts]
    } catch (error) {
      console.error('排序商品失败:', error)
      return products
    }
  },

  onSearchInput(e) {
    try {
      const value = e.detail.value
      this.setData({
        searchKeyword: value || ''
      }, () => {
        this.filterProducts()
      })
    } catch (error) {
      console.error('搜索输入处理失败:', error)
    }
  },

  clearSearch() {
    try {
      this.setData({
        searchKeyword: ''
      }, () => {
        this.filterProducts()
      })
    } catch (error) {
      console.error('清除搜索失败:', error)
    }
  },

  filterProducts() {
    try {
      const keyword = this.data.searchKeyword.trim()
      let filtered = [...this.data.products]

      if (keyword) {
        // 搜索时仍保持置顶逻辑
        filtered = filtered.filter(p => {
          return p && p.name && p.name.toLowerCase().includes(keyword.toLowerCase())
        })

        // 先按置顶状态分组
        const pinnedProducts = filtered.filter(p => p.isPinned)
        const unpinnedProducts = filtered.filter(p => !p.isPinned)

        // 分别对置顶和非置顶产品按日期排序
        const sortByDate = (a, b) => {
          const aDate = new Date(a.date).getTime()
          const bDate = new Date(b.date).getTime()
          return aDate - bDate  // 旧的日期在下方
        }

        pinnedProducts.sort(sortByDate)
        unpinnedProducts.sort(sortByDate)

        // 合并结果，确保置顶商品在顶部
        filtered = [...pinnedProducts, ...unpinnedProducts]

        // 确保每个产品都有必要的属性
        filtered = filtered.map(item => ({
          ...item,
          swipingLeft: false,
          currencySymbol: (item.currency && item.currency.symbol) || '¥'
        }))

        this.setData({
          filteredProducts: filtered
        })
      } else {
        // 没有搜索关键词时，恢复原有排序（包括置顶）
        filtered = filtered.map(item => ({
          ...item,
          swipingLeft: false,
          currencySymbol: (item.currency && item.currency.symbol) || '¥'
        }))

        const sorted = this.sortProductsByCurrentSortOption(filtered)
        this.setData({
          filteredProducts: sorted
        })
      }
    } catch (error) {
      console.error('筛选商品失败:', error)
      // 出错时至少保证显示空列表
      this.setData({
        filteredProducts: []
      })
    }
  },

  toggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    })
  },

  setSortOption(e) {
    this.setData({
      sortBy: e.currentTarget.dataset.sort
    })
    this.sortProducts()
  },

  sortProducts() {
    try {
      const sorted = this.sortProductsByCurrentSortOption([...this.data.filteredProducts])
      this.setData({
        filteredProducts: sorted
      })
    } catch (error) {
      console.error('排序商品失败:', error)
    }
  },

  onTouchStart(e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      currentSwipeIndex: -1
    })
  },

  onTouchMove(e) {
    try {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.data.touchStartX

      if (Math.abs(deltaX) > 5) {
        const index = e.currentTarget.dataset.index
        const products = JSON.parse(JSON.stringify(this.data.filteredProducts))

        // 重置其他卡片的状态
        products.forEach((item, idx) => {
          if (idx !== index) {
            item.swipingLeft = false
          }
        })

        // 设置当前卡片的滑动状态
        products[index].swipingLeft = deltaX < 0

        this.setData({
          filteredProducts: products,
          currentSwipeIndex: index
        })

        if (Math.abs(deltaX) > 10) {
          return false
        }
      }
    } catch (error) {
      console.error('处理滑动事件失败:', error)
    }
  },

  onTouchEnd(e) {
    try {
      if (this.data.currentSwipeIndex === -1) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - this.data.touchStartX
      const index = this.data.currentSwipeIndex
      const products = JSON.parse(JSON.stringify(this.data.filteredProducts))

      if (deltaX > -60) {
        products[index].swipingLeft = false
      }

      // 使用回调确保状态更新完成
      this.setData({
        filteredProducts: products
      }, () => {
        // 延迟重置 currentSwipeIndex，确保动画完成
        setTimeout(() => {
          this.setData({
            currentSwipeIndex: -1
          })
        }, 100)
      })
    } catch (error) {
      console.error('触摸结束时发生错误:', error)
      // 发生错误时也要重置状态
      this.setData({
        currentSwipeIndex: -1
      })
    }
  },

  togglePin(e) {
    try {
      const index = e.currentTarget.dataset.index
      const product = this.data.filteredProducts[index]
      if (!product) return

      const products = getAllProducts()
      const name = product.name

      products.forEach(p => {
        if (p.name === name) {
          p.isPinned = !p.isPinned
        }
      })

      saveAllProducts(products)
      this.loadProducts()

      wx.showToast({
        title: product.isPinned ? '已取消置顶' : '已置顶',
        icon: 'success'
      })
    } catch (error) {
      console.error('切换置顶状态失败:', error)
    }
  },

  deleteProduct(e) {
    try {
      const index = e.currentTarget.dataset.index
      const product = this.data.filteredProducts[index]
      if (!product) return

      wx.showModal({
        title: '确认删除',
        content: '确定要删除所有"' + product.name + '"相关的商品吗？',
        success: (res) => {
          if (res.confirm) {
            const products = getAllProducts()
            products.forEach(p => {
              if (p.name === product.name) {
                deleteProduct(p.id)
              }
            })
            this.loadProducts()
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    } catch (error) {
      console.error('删除商品失败:', error)
    }
  },

  goToDetail(e) {
    try {
      // 如果正在滑动，则不触发跳转
      if (this.data.currentSwipeIndex !== -1) {
        return
      }

      const index = e.currentTarget.dataset.index
      const product = this.data.filteredProducts[index]
      if (!product || !product.id) {
        console.error('无效的商品数据:', product)
        return
      }

      // 重置所有卡片的滑动状态
      const products = this.data.filteredProducts.map(p => ({
        ...p,
        swipingLeft: false
      }))

      this.setData({
        filteredProducts: products
      }, () => {
        wx.navigateTo({
          url: `/pages/detail/detail?id=${encodeURIComponent(product.id)}`
        })
      })
    } catch (error) {
      console.error('跳转到详情页失败:', error)
      wx.showToast({
        title: '跳转失败',
        icon: 'error'
      })
    }
  },

  goToAdd() {
    wx.reLaunch({
      url: '/pages/add/add'
    })
  },

  onPullDownRefresh() {
    this.loadProducts()
    wx.stopPullDownRefresh()
  }
})