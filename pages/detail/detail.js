const { createProduct } = require('../../models/product');
const { formatAmount } = require('../../services/currencyService');
Page({
  // 品牌省略显示（如“华为科技旗舰店”→“华...店”）
  ellipsisBrand: function (str) {
    if (str.length <= 4) return str;
    // 只保留首字和末两字，中间省略
    return str.slice(0, 2) + '.' + str.slice(-1);
  },
  // 店铺省略显示（如“苏宁易购旗舰店”→“苏...店”）
  ellipsisLocation: function (str) {
    if (str.length <= 5) return str;
    // 只保留首字和末两字，中间省略
    return str.slice(0, 1) + '...' + str.slice(-2);
  },
  data: {
    product: null,
    priceHistory: [],
    priceHistoryCount: 0,
    filterType: 'all', // all/brand/location
    brandList: [],
    locationList: [],
    selectedBrand: '',
    selectedLocation: '',
    brandIndex: 0,
    locationIndex: 0
  },

  onLoad: function (options) {
    wx.pageScrollTo({ scrollTop: 0 });
    if (options.id) {
      this.loadProductDetail(options.id);
    }
  },

  // 顶部筛选切换，三选一且互斥
  onFilterTypeChange: function (e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'all') {
      this.setData({
        filterType: 'all',
        selectedBrand: '',
        selectedLocation: '',
        brandIndex: 0,
        locationIndex: 0
      }, () => {
        this.loadPriceHistory(this.data.product.name);
      });
    } else if (type === 'brand') {
      this.setData({
        filterType: 'brand',
        selectedLocation: '',
        locationIndex: 0
      });
    } else if (type === 'location') {
      this.setData({
        filterType: 'location',
        selectedBrand: '',
        brandIndex: 0
      });
    }
  },

  // 品牌选择
  onBrandPickerChange: function (e) {
    const index = e.detail.value;
    const brand = this.data.brandList[index];
    this.setData({
      brandIndex: index,
      selectedBrand: this.ellipsisBrand(brand),
      filterType: 'brand',
      selectedLocation: '',
      locationIndex: 0
    }, () => {
      this.loadPriceHistory(this.data.product.name);
    });
  },

  // 店铺选择
  onLocationPickerChange: function (e) {
    const index = e.detail.value;
    const location = this.data.locationList[index];
    this.setData({
      locationIndex: index,
      selectedLocation: this.ellipsisLocation(location),
      filterType: 'location',
      selectedBrand: '',
      brandIndex: 0
    }, () => {
      this.loadPriceHistory(this.data.product.name);
    });
  },

  // 加载商品详情
  loadProductDetail: function (id) {
    try {
      var products = wx.getStorageSync('products') || [];
      var product = products.find(function (p) {
        return p.id === id;
      });
      if (product) {
        var stdProduct = createProduct(product);
        this.setData({ product: stdProduct });
        this.loadPriceHistory(stdProduct.name);
      } else {
        wx.showToast({ title: '商品不存在', icon: 'error' });
        setTimeout(function () { wx.navigateBack(); }, 1500);
      }
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载价格历史和品牌/店铺列表
  loadPriceHistory: function (productName, highlightId) {
    try {
      var products = wx.getStorageSync('products') || [];
      var history = products.filter(function (p) {
        return p.name.toLowerCase() === productName.toLowerCase();
      });
      const brandList = Array.from(new Set(history.map(p => p.brand).filter(Boolean)));
      const locationList = Array.from(new Set(history.map(p => p.location).filter(Boolean)));
      let filterType = this.data.filterType;
      let selectedBrand = this.data.selectedBrand;
      let selectedLocation = this.data.selectedLocation;
      let filtered = history;
      if (filterType === 'brand' && selectedBrand) {
        filtered = history.filter(p => p.brand === selectedBrand);
      } else if (filterType === 'location' && selectedLocation) {
        filtered = history.filter(p => p.location === selectedLocation);
      }
      filtered = filtered.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      const priceHistoryCount = filtered.length;
      if (filtered && filtered.length > 20) filtered = filtered.slice(0, 20);
      let min = filtered.length ? Math.min(...filtered.map(h => Number(h.currentPrice))) : 0;
      let max = filtered.length ? Math.max(...filtered.map(h => Number(h.currentPrice))) : 0;
      let range = max - min || 1;
      // 找到价格最低的商品id
      let minItem = filtered.find(item => Number(item.currentPrice) === min);
      let minId = minItem ? minItem.id : null;
      // 如果有高亮id，则主展示为该id对应商品，否则为最低价商品
      let mainItem = highlightId ? filtered.find(item => item.id === highlightId) : minItem;
      let chartPoints = filtered.map((item, idx) => {
        return {
          ...item,
          x: 30 + (idx * 240 / (filtered.length - 1 || 1)),
          y: 120 - ((Number(item.currentPrice) - min) / range) * 80,
          isCurrent: item.id === (highlightId || minId),
          isMin: Number(item.currentPrice) === min
        };
      });
      let mainProduct = mainItem ? createProduct(mainItem) : null;
      this.setData({
        product: mainProduct,
        priceHistory: chartPoints,
        priceHistoryCount,
        brandList,
        locationList
      });
      setTimeout(this.drawTrendChart, 100);
    } catch (error) { }
  },

  // 折线图点点击事件：跳转到对应商品详情
  onTrendPointTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showModal({ title: '调试', content: '未获取到id', showCancel: false });
      return;
    }
    const item = this.data.priceHistory.find(i => i.id === id);
    if (!item) {
      wx.showModal({ title: '调试', content: '未找到item', showCancel: false });
      return;
    }
    // 将点击的item作为主展示
    this.setData({
      product: createProduct(item)
    });
    // 用点击id高亮趋势和记录
    this.loadPriceHistory(item.name, id);
    // 点击趋势点后回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    // 不跳转页面，直接切换主展示和高亮
  },

  // 点击价格记录卡片时高亮并展示该项，但不改变筛选条件，且回到顶部
  onHistoryItemTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showModal({ title: '调试', content: '未获取到id', showCancel: false });
      return;
    }
    const item = this.data.priceHistory.find(i => i.id === id);
    if (!item) {
      wx.showModal({ title: '调试', content: '未找到item', showCancel: false });
      return;
    }
    // 将点击的item作为主展示
    this.setData({
      product: createProduct(item)
    });
    // 用点击id高亮趋势和记录
    this.loadPriceHistory(item.name, id);
    // 点击历史项后回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },
  drawTrendChart: function () {
    if (!this.data.priceHistory || this.data.priceHistory.length < 2) return;
    const ctx = wx.createCanvasContext('trendCanvas', this);
    const points = this.data.priceHistory;
    ctx.setStrokeStyle('#007AFF');
    ctx.setLineWidth(2);
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    points.forEach(pt => {
      const isMin = pt.isMin;
      const isCurrent = pt.isCurrent;
      const green = '#34C759';
      const blue = '#007AFF';
      ctx.setFillStyle(isCurrent ? (isMin ? green : blue) : '#FFF');
      ctx.setStrokeStyle(isMin ? green : blue);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.setFontSize(10);
      ctx.setFillStyle(isMin ? green : blue);
      ctx.fillText('¥' + pt.currentPrice, pt.x - 12, pt.y - 12);
    });
    ctx.draw();
  },

  // 编辑商品
  editProduct: function () {
    if (!this.data.product || !this.data.product.id) {
      wx.showToast({ title: '无效商品', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/edit/edit?id=' + this.data.product.id });
  },

  // 删除商品
  deleteProduct: function () {
    var self = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除"' + this.data.product.name + '"吗？',
      success: function (res) {
        if (res.confirm) {
          try {
            var products = wx.getStorageSync('products') || [];
            var updatedProducts = products.filter(function (p) {
              return p.id !== self.data.product.id;
            });
            wx.setStorageSync('products', updatedProducts);
            wx.showToast({ title: '删除成功', icon: 'success' });
            // 刷新页面内容，保持筛选，并回到顶部
            setTimeout(function () {
              self.loadPriceHistory(self.data.product ? self.data.product.name : '', null);
              wx.pageScrollTo({
                scrollTop: 0,
                duration: 300
              });
            }, 500);
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
