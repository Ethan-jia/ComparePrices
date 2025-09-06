/**
 * 统计页面
 * 
 * 功能：
 * 1. 显示商品统计数据
 * 2. 按时间段筛选统计
 * 3. 展示最近添加的商品
 */

const { getAllProducts, saveAllProducts } = require('../../services/productService');
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

  /**
   * 加载统计数据
   * 使用服务层获取所有商品数据，并计算各项统计指标
   */
  loadStatistics: function () {
    try {
      // 使用productService获取所有商品
      const products = getAllProducts().map(createProduct);

      // 根据所选时间段筛选商品
      const filteredProducts = this.filterProductsByPeriod(products);

      // 计算统计指标
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

  /**
   * 根据时间段筛选商品
   * @param {Array} products - 商品列表
   * @returns {Array} 筛选后的商品列表
   */
  filterProductsByPeriod: function (products) {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 使用箭头函数，不需要bind(this)
      return products.filter((product) => {
        const productDate = new Date(product.date);

        switch (this.data.selectedPeriod) {
          case 'month':
            return productDate.getMonth() === currentMonth &&
              productDate.getFullYear() === currentYear;
          case 'year':
            return productDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    } catch (error) {
      console.error('筛选商品失败:', error);
      return products;
    }
  },

  /**
   * 计算基础统计数据
   * @param {Array} products - 商品列表
   */
  calculateBasicStats: function (products) {
    try {
      const totalProducts = products.length;

      // 计算总支出（所有商品当前价格总和）
      const totalSpent = products.reduce((sum, product) =>
        sum + parseFloat(product.currentPrice || 0), 0);

      // 计算平均价格
      const averagePrice = totalProducts > 0 ? totalSpent / totalProducts : 0;

      this.setData({
        totalProducts,
        totalSpent: totalSpent.toFixed(2),
        averagePrice: averagePrice.toFixed(2)
      });
    } catch (error) {
      console.error('计算基础统计失败:', error);
    }
  },

  /**
   * 计算月度统计数据
   * @param {Array} products - 商品列表
   */
  calculateMonthlyStats: function (products) {
    try {
      const monthlyMap = {};
      const months = ['1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'];

      // 按月份统计商品数量和支出
      products.forEach(product => {
        const productDate = new Date(product.date);
        const month = productDate.getMonth();
        const monthKey = months[month];

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

      // 整理月度统计数据，确保每个月都有数据
      const monthlyStats = [];
      let maxSpent = 0;

      for (let i = 0; i < months.length; i++) {
        const monthKey = months[i];
        const stats = monthlyMap[monthKey] || {
          month: monthKey,
          totalSpent: 0,
          count: 0
        };

        // 记录最大支出金额，用于计算百分比
        if (stats.totalSpent > maxSpent) {
          maxSpent = stats.totalSpent;
        }
        monthlyStats.push(stats);
      }

      // 计算柱状图宽度和金额格式化
      monthlyStats.forEach(stats => {
        stats.barWidth = maxSpent > 0 ? (stats.totalSpent / maxSpent * 100) : 0;
        stats.totalSpent = parseFloat(stats.totalSpent).toFixed(2);
      });

      this.setData({
        monthlyStats
      });
    } catch (error) {
      console.error('计算月度统计失败:', error);
    }
  },

  /**
   * 加载最近添加的商品
   * @param {Array} products - 商品列表
   */
  loadRecentProducts: function (products) {
    try {
      // 按日期降序排序，并取前5条
      const recentProducts = products
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(product => ({
          ...product,
          // 确保所有商品都有货币符号
          currencySymbol: (product.currency && product.currency.symbol) ?
            product.currency.symbol : '¥'
        }));

      this.setData({
        recentProducts
      });
    } catch (error) {
      console.error('加载最近商品失败:', error);
    }
  },

  /**
   * 切换统计时间段
   * @param {Object} e - 事件对象
   */
  onPeriodChange: function (e) {
    const period = e.currentTarget.dataset.period;
    this.setData({
      selectedPeriod: period
    }, () => {
      // 重新加载统计数据
      this.loadStatistics();
    });
  },

  /**
   * 导出所有商品数据到剪贴板
   * 将数据转换为JSON格式，方便用户备份
   */
  exportData: function () {
    try {
      // 使用服务层获取所有商品
      const products = getAllProducts();
      const dataStr = JSON.stringify(products, null, 2);

      wx.setClipboardData({
        data: dataStr,
        success: () => {
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

  /**
   * 清空所有商品数据
   * 显示确认对话框，防止误操作
   */
  clearData: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 使用服务层清空存储
          saveAllProducts([]);

          // 重新加载统计数据
          this.loadStatistics();

          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 跳转到商品详情页面
   * @param {Object} e - 事件对象
   */
  goToProductDetail: function (e) {
    try {
      const productId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + productId
      });
    } catch (error) {
      console.error('跳转详情失败:', error);
      wx.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  }
});
