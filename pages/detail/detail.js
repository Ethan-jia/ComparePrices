// detail.js
Page({
  // 折线图点点击事件：跳转到对应商品详情
  onTrendPointTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.redirectTo({ url: '/pages/detail/detail?id=' + id });
  },
  data: {
    product: null,
    priceHistory: [],
    showEditModal: false,
    showDiscount: false,
    discountPercent: '0.0',
    showSavings: false,
    savingsAmount: '0.00'
  },

  onLoad: function (options) {
    // 保持本地商品数据不变，避免详情页找不到商品
    if (options.id) {
      this.loadProductDetail(options.id);
    }
  },

  // 编辑商品（采用本地存储editId+switchTab）
  editProduct: function () {
    if (!this.data.product || !this.data.product.id) {
      wx.showToast({ title: '无效商品', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/edit/edit?id=' + this.data.product.id
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
        var discountInfo = this.calculateDiscountInfo(product);
        this.setData({
          product: product,
          showDiscount: discountInfo.showDiscount,
          discountPercent: discountInfo.discountPercent,
          showSavings: discountInfo.showSavings,
          savingsAmount: discountInfo.savingsAmount
        });
        this.loadPriceHistory(product.name);
      } else {
        wx.showToast({
          title: '商品不存在',
          icon: 'error'
        });
        setTimeout(function () {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载商品详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 计算优惠信息
  calculateDiscountInfo: function (product) {
    var result = {
      showDiscount: false,
      discountPercent: '0.0',
      showSavings: false,
      savingsAmount: '0.00'
    };

    if (product.originalPrice && product.currentPrice && product.currentPrice < product.originalPrice) {
      var discount = ((product.originalPrice - product.currentPrice) / product.originalPrice * 100).toFixed(1);
      var savings = (product.originalPrice - product.currentPrice).toFixed(2);

      result.showDiscount = true;
      result.discountPercent = discount;
      result.showSavings = true;
      result.savingsAmount = savings;
    }

    return result;
  },

  // 重写价格趋势折线图为canvas，并支持高亮选中
  loadPriceHistory: function (productName, highlightId) {
    try {
      var products = wx.getStorageSync('products') || [];
      var history = products.filter(function (p) {
        return p.name.toLowerCase() === productName.toLowerCase();
      }).sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      // 只保留最多20条历史（最新的20条）
      if (history && history.length > 20) history = history.slice(0, 20);
      // 计算折线图点坐标
      let min = Math.min(...history.map(h => Number(h.currentPrice)));
      let max = Math.max(...history.map(h => Number(h.currentPrice)));
      let range = max - min || 1;
      let currentId = highlightId || this.data.product.id;
      let chartPoints = history.map((item, idx) => {
        return {
          ...item,
          x: 30 + (idx * 240 / (history.length - 1 || 1)),
          y: 120 - ((Number(item.currentPrice) - min) / range) * 80,
          isCurrent: item.id === currentId
        };
      });
      this.setData({ priceHistory: chartPoints });
      setTimeout(this.drawTrendChart, 100); // 等待渲染
    } catch (error) {
      console.error('加载价格历史失败:', error);
    }
  },

  // 价格历史点击：同步顶部卡片信息并跳转新详情页
  onHistoryItemTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    // 直接跳转到该id的详情页
    wx.redirectTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  drawTrendChart: function () {
    if (!this.data.priceHistory || this.data.priceHistory.length < 2) return;
    const ctx = wx.createCanvasContext('trendCanvas', this);
    const points = this.data.priceHistory;
    // 画线
    ctx.setStrokeStyle('#007AFF');
    ctx.setLineWidth(2);
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    // 画点
    points.forEach(pt => {
      ctx.setFillStyle(pt.isCurrent ? '#007AFF' : '#FFF');
      ctx.setStrokeStyle('#007AFF');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.setFillStyle('#007AFF');
      ctx.setFontSize(10);
      ctx.fillText('¥' + pt.currentPrice, pt.x - 12, pt.y - 12);
    });
    ctx.draw();
  },

  // 编辑商品
  editProduct: function (e) {

    if (!this.data.product || !this.data.product.id) {
      wx.showToast({ title: '无效商品', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: '/pages/edit/edit?id=' + this.data.product.id
    });
    // wx.switchTab({
    //   url: '/pages/detail/detail?id=' + this.data.product.id,
    //   success: function () { console.log('跳转编辑页成功'); },
    //   fail: function (err) {
    //     console.error('跳转编辑页失败', err);
    //     wx.showToast({ title: '跳转失败', icon: 'none' });
    //   }
    // });
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

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });

            setTimeout(function () {
              wx.navigateBack();
            }, 1500);
          } catch (error) {
            console.error('删除商品失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 分享商品（已移除）

  // 计算优惠幅度
  calculateDiscount: function () {
    var product = this.data.product;
    if (product && product.originalPrice && product.currentPrice) {
      var discount = ((product.originalPrice - product.currentPrice) / product.originalPrice * 100).toFixed(1);
      return discount;
    }
    return null;
  },

  // 格式化日期
  formatDate: function (dateStr) {
    try {
      var date = new Date(dateStr);
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    } catch (error) {
      return dateStr;
    }
  }
});
