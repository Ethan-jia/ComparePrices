
const productService = require('../../services/productService');

// 一键生成测试数据（保留原逻辑）
function generateTestProducts() {
  console.log('初始化数据中...');
  const now = Date.now();
  const names = ['牛奶', '苹果', '鸡蛋', '大米', '面包', '矿泉水', '洗发水', '牙膏', '纸巾', '洗衣液', '可口可乐', '雪碧', '酸奶', '橙汁', '火腿肠'];
  const locations = ['家乐福', '永辉超市', '盒马', '本地菜场', '便利店', '沃尔玛', '京东', '天猫'];
  const brands = ['伊利', '蒙牛', '农夫山泉', '可口可乐', '百事', '三元', '光明', '汇源', '统一', '娃哈哈', '洁柔', '蓝月亮', '宝洁', '联合利华', '自有品牌'];
  let products = [];
  for (let i = 1; i <= 100; i++) {
    let name = names[i % names.length];
    let ori = (Math.random() * 30 + 5).toFixed(2);
    let cur = (ori - Math.random() * 5).toFixed(2);
    let date = `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    let location = locations[i % locations.length];
    let brand = brands[i % brands.length];
    let note = i % 7 === 0 ? '促销活动' : '';
    products.push({
      id: 'test' + i,
      name,
      date,
      location,
      brand,
      originalPrice: parseFloat(ori),
      currentPrice: parseFloat(cur),
      note,
      createTime: now - 86400000 * (100 - i),
      updateTime: now - 86400000 * (100 - i)
    });
  }
  productService.saveAllProducts(products);
  wx.showToast({ title: '测试数据已生成', icon: 'success' });
}

// index.js
Page({
  generateTestProducts,
  data: {
    searchKeyword: '',
    products: [],
    filteredProducts: [],
    showFilter: false,
    touchStartX: 0,
    touchStartY: 0,
    currentSwipeIndex: -1,
    sortBy: 'dateDesc', // 默认按日期倒序排序（最新优先）
    // showTestBtn: false // 测试按钮默认隐藏
  },

  onLoad: function () {
    // 生成一批生活化商品数据并持久化（仅首次或无数据时）
    // let products = wx.getStorageSync('products') || [];
    // if (!products || products.length < 100) {
    //   generateTestProducts();
    // }
    this.loadProducts();
  },

  onShow: function () {
    // ...existing code...
    // 长按右下角+号显示测试按钮
    if (typeof this.data.showTestBtn === 'undefined') {
      this.setData({ showTestBtn: false });
    }
  },


  // 供按钮调用
  onGenerateTestData: function () {
    generateTestProducts();
    this.loadProducts();
    wx.showToast({ title: '已生成100条测试数据', icon: 'success' });
  },

  // 加载商品数据（首页只展示每个商品名一条，金额为最低价）
  loadProducts: function () {
    try {
      var products = productService.getAllProducts();
      // 按商品名分组，取每组最低价那条
      var productMap = {};
      products.forEach(function (p) {
        if (!productMap[p.name] || Number(p.currentPrice) < Number(productMap[p.name].currentPrice)) {
          productMap[p.name] = p;
        }
      });
      // 只保留每个商品名最低价那条
      var uniqueProducts = Object.values(productMap);
      // 初始化swiping属性，避免渲染错误
      uniqueProducts.forEach(item => {
        item.swiping = false;
      });
      // 按时间倒序排列（以最低价那条的日期为准）
      uniqueProducts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      this.setData({
        products: uniqueProducts,
        filteredProducts: uniqueProducts
      }, () => {
        // 加载完数据后应用当前排序
        this.sortProducts();
      });
    } catch (error) {
      console.error('加载商品数据失败:', error);
    }
  },

  // 首页不再需要优惠信息
  // calculateProductDiscount: function (product) { return product; },

  // 搜索功能
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterProducts();
  },

  // 清除搜索
  clearSearch: function () {
    this.setData({
      searchKeyword: ''
    });
    this.filterProducts();
  },

  // 选择推荐项
  // selectCategory 已移除

  // 筛选商品
  filterProducts: function () {
    try {
      var filtered = this.data.products;
      // 按关键词筛选（为空时不过滤，显示全部）
      if (this.data.searchKeyword && this.data.searchKeyword.trim() !== '') {
        var keyword = this.data.searchKeyword.toLowerCase();
        filtered = filtered.filter((product) => {
          return product.name.toLowerCase().indexOf(keyword) !== -1;
        });
      }
      // category 相关筛选已移除
      this.setData({
        filteredProducts: filtered
      }, () => {
        // 筛选后进行排序
        this.sortProducts();
      });
    } catch (error) {
      console.error('筛选商品失败:', error);
    }
  },

  // 切换筛选面板
  toggleFilter: function () {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 设置排序选项
  setSortOption: function (e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({
      sortBy: sortBy
    });
    this.sortProducts();
  },

  // 根据选择的排序方式对商品进行排序
  sortProducts: function () {
    try {
      const sortBy = this.data.sortBy;
      // 深复制确保不直接修改原始数据
      let sorted = JSON.parse(JSON.stringify(this.data.filteredProducts));

      // 确保每个对象都有swiping属性
      sorted.forEach(item => {
        if (typeof item.swiping === 'undefined') {
          item.swiping = false;
        }
      });

      switch (sortBy) {
        case 'priceAsc':
          sorted.sort((a, b) => Number(a.currentPrice) - Number(b.currentPrice));
          break;
        case 'priceDesc':
          sorted.sort((a, b) => Number(b.currentPrice) - Number(a.currentPrice));
          break;
        case 'dateAsc':
          sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'dateDesc':
          sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        default:
          // 默认按日期倒序
          sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      this.setData({
        filteredProducts: sorted
      });
    } catch (error) {
      console.error('排序商品失败:', error);
    }
  },

  // 跳转到添加页面
  goToAdd: function () {
    wx.switchTab({
      url: '/pages/add/add'
    });
  },

  // 跳转到详情页面
  goToDetail: function (e) {
    try {
      var index = e.currentTarget.dataset.index;
      var product = this.data.filteredProducts[index];
      if (product && !product.swiping) {
        wx.navigateTo({
          url: '/pages/detail/detail?id=' + product.id
        });
      }
    } catch (error) {
      console.error('跳转详情页失败:', error);
    }
  },

  // 触摸开始
  onTouchStart: function (e) {
    var touch = e.touches[0];
    this.setData({
      touchStartX: touch.clientX,
      touchStartY: touch.clientY
    });
  },

  // 触摸移动
  onTouchMove: function (e) {
    var touch = e.touches[0];
    var deltaX = touch.clientX - this.data.touchStartX;
    var deltaY = touch.clientY - this.data.touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      var index = e.currentTarget.dataset.index;
      // 先深复制一份数据，避免直接修改引用
      var products = JSON.parse(JSON.stringify(this.data.filteredProducts));

      // 确保每个产品对象都有swiping属性
      products.forEach((item, idx) => {
        if (typeof item.swiping === 'undefined') {
          item.swiping = false;
        }
      });

      if (deltaX < -30) {
        // 向左滑动，显示删除按钮
        for (var i = 0; i < products.length; i++) {
          products[i].swiping = (i === index);
        }
        this.setData({
          filteredProducts: products,
          currentSwipeIndex: index
        });
      } else if (deltaX > 30) {
        // 向右滑动，隐藏删除按钮
        if (products[index]) {
          products[index].swiping = false;
        }
        this.setData({
          filteredProducts: products,
          currentSwipeIndex: -1
        });
      }
    }
  },

  // 触摸结束
  onTouchEnd: function (e) {
    // 空函数，保持接口完整
  },

  // 删除商品（重构：通过service删除同名商品）
  deleteProduct: function (e) {
    try {
      var index = e.currentTarget.dataset.index;
      var product = this.data.filteredProducts[index];
      if (!product) return;
      var name = product.name;
      wx.showModal({
        title: '确认删除',
        content: '确定要删除所有“' + name + '”相关的商品吗？',
        success: function (res) {
          if (res.confirm) {
            productService.deleteProductsByName(name);
            this.loadProducts();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }.bind(this)
      });
    } catch (error) {
      console.error('删除商品失败:', error);
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadProducts();
    wx.stopPullDownRefresh();
  }
});
