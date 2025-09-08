/**
 * 首页
 * 
 * 功能：
 * 1. 显示商品列表
 * 2. 支持搜索和过滤
 * 3. 商品排序
 * 4. 添加、编辑和删除商品
 */

const { getAllProducts, deleteProduct, searchProducts, sortProducts, saveAllProducts } = require('../../services/productService');
const { getDefaultCurrency } = require('../../services/currencyService');
const { getAllProductNames, getAllLocations, getAllBrands, getRecordCountByProductName } = require('../../services/fieldService');

/**
 * 一键生成测试数据
 * 生成100条随机的商品价格记录用于演示
 */
function generateTestProducts() {
  const now = Date.now();

  // 定义测试数据的基础内容
  const commonProducts = [
    '牛奶', '苹果', '鸡蛋', '大米', '面包',
    '矿泉水', '洗发水', '牙膏', '纸巾', '洗衣液',
    '可口可乐', '雪碧', '酸奶', '橙汁', '火腿肠'
  ];

  // 使用服务获取位置和品牌，如果没有，则使用默认值
  const locations = getAllLocations().length > 0
    ? getAllLocations()
    : [
      'Superstore', 'A1超市', '天天超市'
    ];

  const brands = getAllBrands().length > 0
    ? getAllBrands()
    : ['伊利', '蒙牛', '农夫山泉', '可口可乐', '百事', '三元', '光明', '汇源', '统一', '娃哈哈', '洁柔', '蓝月亮', '宝洁', '联合利华', '自有品牌'];

  // 清除现有测试数据
  const existingProducts = getAllProducts();
  existingProducts.forEach(product => {
    if (product.id.startsWith('test')) {
      deleteProduct(product.id);
    }
  });

  // 生成新测试数据
  for (let i = 1; i <= 100; i++) {
    // 随机生成商品数据
    const name = commonProducts[i % commonProducts.length];
    // const name = "牛奶"
    const originalPrice = parseFloat((Math.random() * 30 + 5).toFixed(2));
    const currentPrice = parseFloat((originalPrice - Math.random() * 5).toFixed(2));
    const date = `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    const location = locations[i % locations.length];
    const brand = brands[i % brands.length];
    const note = i % 7 === 0 ? '促销活动' : '';
    const currency = getDefaultCurrency();

    // 使用productService添加产品
    const product = {
      id: 'test' + i,
      name,
      date,
      location,
      brand,
      originalPrice,
      currentPrice,
      currency,
      note,
      createTime: now - 86400000 * (100 - i),
      updateTime: now - 86400000 * (100 - i)
    };

    // 直接保存到存储，不触发添加价格历史逻辑
    const products = getAllProducts();
    products.push(product);
    saveAllProducts(products);
  }

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
    // 每次页面显示时重新加载产品数据，确保数据始终是最新的
    this.loadProducts();

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
      // 使用productService获取所有商品
      const products = getAllProducts();

      // 按商品名分组，取每组最低价那条
      const productMap = {};
      products.forEach(function (p) {
        if (!productMap[p.name] || Number(p.currentPrice) < Number(productMap[p.name].currentPrice)) {
          productMap[p.name] = p;
        }
      });

      // 只保留每个商品名最低价那条
      const uniqueProducts = Object.values(productMap);

      // 初始化swiping属性，避免渲染错误
      uniqueProducts.forEach(item => {
        item.swiping = false;
        // 确保商品有货币符号
        if (item.currency && item.currency.symbol) {
          item.currencySymbol = item.currency.symbol;
        } else {
          item.currencySymbol = '¥';
        }
      });

      // 根据当前排序方式排序
      const sortedProducts = this.sortProductsByCurrentSortOption(uniqueProducts);

      this.setData({
        products: sortedProducts,
        filteredProducts: sortedProducts.map(item => ({ ...item, swiping: false })) // 确保初始化
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
      const keyword = this.data.searchKeyword.trim();

      if (keyword === '') {
        // 如果关键字为空，使用所有产品
        this.setData({
          filteredProducts: this.data.products
        }, () => {
          // 筛选后进行排序
          this.sortProducts();
        });
      } else {
        // 在当前已加载的产品中筛选，而不是重新从存储中获取所有产品
        const filtered = this.data.products.filter(product =>
          product.name.toLowerCase().includes(keyword.toLowerCase())
        );

        this.setData({
          filteredProducts: filtered
        }, () => {
          // 筛选后进行排序
          this.sortProducts();
        });
      }
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
      // 使用服务层的排序功能，但保留UI相关处理（如swiping属性）
      let sorted = this.sortProductsByCurrentSortOption([...this.data.filteredProducts]);

      this.setData({
        filteredProducts: sorted.map(item => ({ ...item, swiping: false })) // 确保初始化
      });
    } catch (error) {
      console.error('排序商品失败:', error);
    }
  },

  // 根据当前排序选项对商品进行排序（抽取共享逻辑）
  sortProductsByCurrentSortOption: function (products) {
    try {
      const sortBy = this.data.sortBy;
      // 深复制确保不直接修改原始数据
      let sorted = JSON.parse(JSON.stringify(products));

      // 确保每个对象都有swiping属性
      sorted.forEach(item => {
        if (typeof item.swiping === 'undefined') {
          item.swiping = false;
        }
      });

      // 转换排序参数，使其与productService兼容
      let field = 'date';
      let ascending = false;

      switch (sortBy) {
        case 'priceAsc':
          field = 'price';
          ascending = true;
          break;
        case 'priceDesc':
          field = 'price';
          ascending = false;
          break;
        case 'dateAsc':
          field = 'date';
          ascending = true;
          break;
        case 'dateDesc':
          field = 'date';
          ascending = false;
          break;
        default:
          field = 'date';
          ascending = false;
      }

      // 使用productService中的排序功能
      return sortProducts(sorted, field, ascending);
    } catch (error) {
      console.error('排序商品失败:', error);
      return products; // 失败时返回原数据
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
      const index = e.currentTarget.dataset.index;
      const product = this.data.filteredProducts[index];

      // 确保产品存在且没有处于滑动状态
      if (product && !product.swiping) {
        // 使用fieldService查询该商品名称的记录数量
        const recordCount = getRecordCountByProductName(product.name);

        // 如果只有一条记录，提示用户添加更多记录
        if (recordCount <= 1) {
          wx.showToast({
            title: '请添加更多记录后查看',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 跳转到详情页
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

  // 删除商品
  deleteProduct: function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const product = this.data.filteredProducts[index];

      if (!product) return;

      const name = product.name;

      wx.showModal({
        title: '确认删除',
        content: '确定要删除所有"' + name + '"相关的商品吗？',
        success: (res) => {
          if (res.confirm) {
            // 使用productService删除同名商品
            const products = getAllProducts();
            products.forEach(p => {
              if (p.name === name) {
                deleteProduct(p.id);
              }
            });

            // 重新加载产品列表
            this.loadProducts();

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
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
