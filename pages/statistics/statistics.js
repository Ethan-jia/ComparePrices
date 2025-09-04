// statistics.js
const { createProduct } = require('../../models/product');
Page({
  // 价格统计弹窗
  showDevModal: function () {
    wx.showModal({
      title: '提示',
      content: '数据统计内容还在开发中',
      showCancel: false
    });
  },
  data: {
    totalProducts: 0,
    totalSpent: 0,
    averagePrice: 0,
    monthlyStats: [],
    recentProducts: [],
    selectedPeriod: 'all',
    periods: [
      { value: 'all', label: '全部' },
      { value: 'month', label: '本月' },
      { value: 'year', label: '今年' }
    ]
  },

  onLoad: function () {
    this.loadStatistics();
  },

  onShow: function () {
    this.loadStatistics();
  },

  // 加载统计数据
  loadStatistics: function () {
    try {
      var products = (wx.getStorageSync('products') || []).map(createProduct);
      var filteredProducts = this.filterProductsByPeriod(products);

      this.calculateBasicStats(filteredProducts);
      this.calculateMonthlyStats(filteredProducts);
      this.loadRecentProducts(products);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      wx.showToast({
        title: '加载统计失败',
        icon: 'none'
      });
    }
  },

  // 根据时间段筛选商品
  filterProductsByPeriod: function (products) {
    try {
      var now = new Date();
      var currentMonth = now.getMonth();
      var currentYear = now.getFullYear();

      return products.filter(function (product) {
        var productDate = new Date(product.date);

        switch (this.data.selectedPeriod) {
          case 'month':
            return productDate.getMonth() === currentMonth &&
              productDate.getFullYear() === currentYear;
          case 'year':
            return productDate.getFullYear() === currentYear;
          default:
            return true;
        }
      }.bind(this));
    } catch (error) {
      console.error('筛选商品失败:', error);
      return products;
    }
  },

  // 计算基础统计
  calculateBasicStats: function (products) {
    try {
      var totalProducts = products.length;
      var totalSpent = products.reduce(function (sum, product) {
        return sum + product.currentPrice;
      }, 0);
      var averagePrice = totalProducts > 0 ? totalSpent / totalProducts : 0;

      this.setData({
        totalProducts: totalProducts,
        totalSpent: totalSpent.toFixed(2),
        averagePrice: averagePrice.toFixed(2)
      });
    } catch (error) {
      console.error('计算基础统计失败:', error);
    }
  },

  // 计算分类统计
  // calculateCategoryStats 已移除

  // 计算月度统计
  calculateMonthlyStats: function (products) {
    try {
      var monthlyMap = {};
      var months = ['1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'];

      products.forEach(function (product) {
        var productDate = new Date(product.date);
        var month = productDate.getMonth();
        var monthKey = months[month];

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            month: monthKey,
            totalSpent: 0,
            count: 0
          };
        }
        monthlyMap[monthKey].totalSpent += product.currentPrice;
        monthlyMap[monthKey].count++;
      });

      var monthlyStats = [];
      var maxSpent = 0;
      for (var i = 0; i < months.length; i++) {
        var monthKey = months[i];
        var stats = monthlyMap[monthKey] || {
          month: monthKey,
          totalSpent: 0,
          count: 0
        };
        if (stats.totalSpent > maxSpent) {
          maxSpent = stats.totalSpent;
        }
        monthlyStats.push(stats);
      }

      // 计算柱状图宽度和金额格式化
      monthlyStats.forEach(function (stats) {
        stats.barWidth = maxSpent > 0 ? (stats.totalSpent / maxSpent * 100) : 0;
        stats.totalSpent = stats.totalSpent.toFixed(2);
      });

      this.setData({
        monthlyStats: monthlyStats
      });
    } catch (error) {
      console.error('计算月度统计失败:', error);
    }
  },

  // 加载最近商品
  loadRecentProducts: function (products) {
    try {
      var recentProducts = products
        .sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        })
        .slice(0, 5);

      this.setData({
        recentProducts: recentProducts
      });
    } catch (error) {
      console.error('加载最近商品失败:', error);
    }
  },

  // 切换时间段
  onPeriodChange: function (e) {
    var period = e.currentTarget.dataset.period;
    this.setData({
      selectedPeriod: period
    });
    this.loadStatistics();
  },

  // 导出数据
  exportData: function () {
    try {
      var products = wx.getStorageSync('products') || [];
      var dataStr = JSON.stringify(products, null, 2);

      wx.setClipboardData({
        data: dataStr,
        success: function () {
          wx.showToast({
            title: '数据已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    } catch (error) {
      console.error('导出数据失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  // 清空数据
  clearData: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('products');
          this.loadStatistics();
          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          });
        }
      }.bind(this)
    });
  },

  // 跳转到商品详情
  goToProductDetail: function (e) {
    try {
      var productId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + productId
      });
    } catch (error) {
      console.error('跳转详情失败:', error);
    }
  }
});
