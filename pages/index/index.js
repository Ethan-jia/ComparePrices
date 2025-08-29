// 一键生成测试数据
function generateTestProducts() {
  console.log('初始化数据中...');
  const now = Date.now();
  const names = ['牛奶', '苹果', '鸡蛋', '大米', '面包', '矿泉水', '洗发水', '牙膏', '纸巾', '洗衣液', '可口可乐', '雪碧', '酸奶', '橙汁', '火腿肠'];
  const locations = ['家乐福', '永辉超市', '盒马', '本地菜场', '便利店', '沃尔玛', '京东', '天猫'];
  let products = [];
  for (let i = 1; i <= 100; i++) {
    let name = names[i % names.length];
    let ori = (Math.random() * 30 + 5).toFixed(2);
    let cur = (ori - Math.random() * 5).toFixed(2);
    let date = `2025-08-${String((i % 28) + 1).padStart(2, '0')}`;
    let location = locations[i % locations.length];
    let note = i % 7 === 0 ? '促销活动' : '';
    let category = i % 2 === 0 ? '食品' : '日用品';
    products.push({
      id: 'test' + i,
      name,
      date,
      location,
      originalPrice: parseFloat(ori),
      currentPrice: parseFloat(cur),
      category,
      note,
      createTime: now - 86400000 * (100 - i),
      updateTime: now - 86400000 * (100 - i)
    });
  }
  wx.setStorageSync('products', products);
  wx.showToast({ title: '测试数据已生成', icon: 'success' });
}

// index.js
Page({
  generateTestProducts,
  data: {
    searchKeyword: '',
    selectedCategory: '',
    categories: [], // 动态推荐
    products: [],
    filteredProducts: [],
    showFilter: false,
    touchStartX: 0,
    touchStartY: 0,
    currentSwipeIndex: -1
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
  },

  // 供按钮调用
  onGenerateTestData: function () {
    generateTestProducts();
    this.onShow(); // 刷新页面
    this.loadProducts();
  },

  // 加载商品数据
  loadProducts: function () {
    try {
      var products = wx.getStorageSync('products') || [];
      // 移除所有商品的category字段
      products.forEach(function (p) { delete p.category; });
      // 按时间倒序排列
      products.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      // 为每个商品计算优惠信息
      var productsWithDiscount = products.map(function (product) {
        return this.calculateProductDiscount(product);
      }.bind(this));
      // 动态推荐筛选项（如商品名、地点、日期等，示例取前5个商品名）
      let nameSet = new Set();
      productsWithDiscount.forEach(p => nameSet.add(p.name));
      let recommend = Array.from(nameSet).slice(0, 5);
      this.setData({
        products: productsWithDiscount,
        filteredProducts: productsWithDiscount,
        categories: recommend,
        selectedCategory: '' // 初始无选中
      });
    } catch (error) {
      console.error('加载商品数据失败:', error);
    }
  },

  // 计算商品优惠信息
  calculateProductDiscount: function (product) {
    var result = {};
    for (var key in product) {
      result[key] = product[key];
    }

    if (product.originalPrice && product.currentPrice && product.currentPrice < product.originalPrice) {
      result.showDiscount = true;
      result.savedAmount = (product.originalPrice - product.currentPrice).toFixed(2);
    } else {
      result.showDiscount = false;
      result.savedAmount = '0.00';
    }

    return result;
  },

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
  selectCategory: function (e) {
    var category = e.currentTarget.dataset.category;
    // 再次点击已选项则取消筛选
    this.setData({
      selectedCategory: this.data.selectedCategory === category ? '' : category
    });
    this.filterProducts();
  },

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
      // 按推荐项筛选（如商品名）
      if (this.data.selectedCategory && this.data.categories.length > 0) {
        filtered = filtered.filter((product) => {
          return product.name === this.data.selectedCategory;
        });
      }
      this.setData({
        filteredProducts: filtered
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
      var products = this.data.filteredProducts.slice();

      if (deltaX < -30) {
        // 向左滑动，显示删除按钮
        for (var i = 0; i < products.length; i++) {
          if (i !== index) {
            products[i].swiping = false;
          }
        }
        products[index].swiping = true;
        this.setData({
          filteredProducts: products,
          currentSwipeIndex: index
        });
      } else if (deltaX > 30) {
        // 向右滑动，隐藏删除按钮
        products[index].swiping = false;
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

  // 删除商品
  deleteProduct: function (e) {
    try {
      var index = e.currentTarget.dataset.index;
      var product = this.data.filteredProducts[index];

      wx.showModal({
        title: '确认删除',
        content: '确定要删除"' + product.name + '"吗？',
        success: function (res) {
          if (res.confirm) {
            var products = this.data.products.filter(function (p) {
              return p.id !== product.id;
            });
            wx.setStorageSync('products', products);
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
