/**
 * 商品详情页
 *  // 品牌省略  // 品牌省略显示（  // 店铺省略显示（如"苏宁易购旗舰店"→"苏...店"）
  ellipsisLocation: function (str) {
    if (!str) return '';
    if (str.length <= 5) return str;
    // 只保留首字和末两字，中间省略
    return str.slice(0, 1) + '...' + str.slice(-2);
  },旗舰店"→"华...店"）
  ellipsisBrand: function (str) {
    if (!str) return '';
    if (str.length <= 4) return str;
    // 只保留首字和末两字，中间省略
    return str.slice(0, 2) + '..' + str.slice(-1);
  },为科技旗舰店"→"华...店"）
  ellipsisBrand: function (str) {
    if (!str) return '';
    if (str.length <= 4) return str;
    // 只保留首字和末字，中间省略
    return str.slice(0, 2) + '..' + str.slice(-1);
  },
  // 店铺省略显示（如"苏宁易购旗舰店"→"苏...店"）
  ellipsisLocation: function (str) {
    if (!str) return '';
    if (str.length <= 5) return str;
    // 只保留首字和末两字，中间省略* 1. 展示商品详情
 * 2. 显示价格历史
 * 3. 提供编辑和删除功能
 * 4. 过滤价格历史记录
 * 5. 显示价格趋势图
 */

const { formatAmount } = require('../../services/currencyService');
const { getProductById, deleteProduct } = require('../../services/productService');
const { getPriceHistory, getPriceHistoryByName, calculatePriceTrend, prepareTrendChartData } = require('../../services/priceHistoryService');
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
    locationIndex: 0,
    touchStartX: 0,
    touchStartY: 0
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
      // 检查是否有品牌数据
      if (this.data.brandList.length === 0) {
        wx.showToast({
          title: '没有品牌数据可筛选',
          icon: 'none'
        });
        return;
      }

      this.setData({
        filterType: 'brand',
        selectedLocation: '',
        locationIndex: 0
      });
    } else if (type === 'location') {
      // 检查是否有店铺数据
      if (this.data.locationList.length === 0) {
        wx.showToast({
          title: '没有店铺数据可筛选',
          icon: 'none'
        });
        return;
      }

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
    if (this.data.brandList.length === 0) {
      wx.showToast({
        title: '没有品牌数据可筛选',
        icon: 'none'
      });
      return;
    }

    const brand = this.data.brandList[index];
    if (!brand) {
      wx.showToast({
        title: '无效的品牌选择',
        icon: 'none'
      });
      return;
    }

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
    if (this.data.locationList.length === 0) {
      wx.showToast({
        title: '没有店铺数据可筛选',
        icon: 'none'
      });
      return;
    }

    const location = this.data.locationList[index];
    if (!location) {
      wx.showToast({
        title: '无效的店铺选择',
        icon: 'none'
      });
      return;
    }

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

  /**
   * 加载商品详情
   * @param {string} id - 商品ID
   */
  loadProductDetail: function (id) {
    try {
      // 使用productService获取商品详情
      const product = getProductById(id);

      if (product) {
        // 设置商品数据并加载价格历史
        this.setData({ product });
        this.loadPriceHistory(product.name);
      } else {
        // 商品不存在
        wx.showToast({
          title: '商品不存在或已被删除',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      // 错误处理
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 加载价格历史和品牌/店铺列表
   * @param {string} productName - 商品名称
   * @param {string} highlightId - 要高亮显示的商品ID（可选）
   */
  loadPriceHistory: function (productName, highlightId) {
    try {
      // 使用priceHistoryService获取价格历史
      const priceHistoryData = getPriceHistoryByName(productName);

      // 获取同名商品列表
      let productsWithSameName = priceHistoryData.products;

      // 如果不能找到商品，直接返回
      if (!productsWithSameName.length) {
        this.setData({
          priceHistory: [],
          brandList: [],
          locationList: []
        });
        return;
      }

      // 如果当前显示的商品不在列表中，使用第一个
      if (this.data.product && !productsWithSameName.some(p => p.id === this.data.product.id)) {
        this.setData({ product: productsWithSameName[0] });
      }

      // 收集所有品牌和地点，使用Set来自动去重
      const brandList = Array.from(new Set(
        productsWithSameName
          .map(p => p.brand)
          .filter(Boolean) // 过滤掉空值
      ));

      const locationList = Array.from(new Set(
        productsWithSameName
          .map(p => p.location)
          .filter(Boolean) // 过滤掉空值
      ));

      // 处理筛选条件和数据变化
      let resetFilter = false;
      let newFilterType = this.data.filterType;
      let newSelectedBrand = this.data.selectedBrand;
      let newBrandIndex = this.data.brandIndex;
      let newSelectedLocation = this.data.selectedLocation;
      let newLocationIndex = this.data.locationIndex;

      // 如果没有品牌数据，但当前筛选是品牌
      if (brandList.length === 0 && this.data.filterType === 'brand') {
        newFilterType = 'all';
        newSelectedBrand = '';
        newBrandIndex = 0;
        resetFilter = true;
      }
      // 如果有品牌数据，但当前选择的品牌不在列表中
      else if (brandList.length > 0 && this.data.filterType === 'brand' &&
        this.data.selectedBrand && !brandList.includes(this.data.selectedBrand)) {
        // 尝试找到近似匹配
        const similarBrand = brandList.find(b => b.includes(this.data.selectedBrand) ||
          this.data.selectedBrand.includes(b));
        if (similarBrand) {
          newSelectedBrand = this.ellipsisBrand(similarBrand);
          newBrandIndex = brandList.indexOf(similarBrand);
        } else {
          newSelectedBrand = '';
          newBrandIndex = 0;
        }
        resetFilter = true;
      }

      // 如果没有店铺数据，但当前筛选是店铺
      if (locationList.length === 0 && this.data.filterType === 'location') {
        newFilterType = 'all';
        newSelectedLocation = '';
        newLocationIndex = 0;
        resetFilter = true;
      }
      // 如果有店铺数据，但当前选择的店铺不在列表中
      else if (locationList.length > 0 && this.data.filterType === 'location' &&
        this.data.selectedLocation && !locationList.includes(this.data.selectedLocation)) {
        // 尝试找到近似匹配
        const similarLocation = locationList.find(l => l.includes(this.data.selectedLocation) ||
          this.data.selectedLocation.includes(l));
        if (similarLocation) {
          newSelectedLocation = this.ellipsisLocation(similarLocation);
          newLocationIndex = locationList.indexOf(similarLocation);
        } else {
          newSelectedLocation = '';
          newLocationIndex = 0;
        }
        resetFilter = true;
      }

      // 如果需要重置筛选条件
      if (resetFilter) {
        this.setData({
          filterType: newFilterType,
          selectedBrand: newSelectedBrand,
          brandIndex: newBrandIndex,
          selectedLocation: newSelectedLocation,
          locationIndex: newLocationIndex
        });
      }

      // 应用过滤条件
      const filterType = this.data.filterType;
      const selectedBrand = this.data.selectedBrand;
      const selectedLocation = this.data.selectedLocation;
      let filtered = productsWithSameName;

      // 根据筛选类型应用不同的过滤条件
      if (filterType === 'brand' && selectedBrand) {
        // 按品牌筛选
        filtered = productsWithSameName.filter(p => p.brand === selectedBrand);
      } else if (filterType === 'location' && selectedLocation) {
        // 按购买地点筛选
        filtered = productsWithSameName.filter(p => p.location === selectedLocation);
      }

      // 按日期降序排序（从新到旧）
      filtered = filtered.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      const priceHistoryCount = filtered.length;

      // 限制展示数量
      if (filtered && filtered.length > 20) filtered = filtered.slice(0, 20);

      // 使用 priceHistoryService 的 prepareTrendChartData 方法获取图表数据
      const chartData = prepareTrendChartData(filtered, highlightId);

      // 更新状态
      this.setData({
        product: chartData.mainItem || null,
        priceHistory: chartData.chartPoints,
        priceHistoryCount,
        brandList,
        locationList,
      }, () => {
        setTimeout(this.drawTrendChart, 100);
      });
    } catch (error) {
      wx.showToast({
        title: '加载价格历史失败',
        icon: 'none'
      });
    }
  },

  // 折线图点点击事件：跳转到对应商品详情
  onTrendPointTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showToast({ title: '无效的记录', icon: 'none' });
      return;
    }

    const item = this.data.priceHistory.find(i => i.id === id);
    if (!item) {
      wx.showToast({ title: '找不到记录', icon: 'none' });
      return;
    }

    // 将点击的item作为主展示
    this.setData({
      product: item
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
      wx.showToast({ title: '无效的记录', icon: 'none' });
      return;
    }

    const item = this.data.priceHistory.find(i => i.id === id);
    if (!item) {
      wx.showToast({ title: '找不到记录', icon: 'none' });
      return;
    }

    // 将点击的item作为主展示
    this.setData({
      product: item
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
      ctx.fillText(pt.currencySymbol + pt.currentPrice, pt.x - 12, pt.y - 12);
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

  /**
   * 删除商品或价格历史记录
   * 无论是底部删除按钮还是滑动删除按钮，都使用此方法
   */
  deleteProduct: function (e) {
    // 获取被点击的删除按钮对应的历史记录ID
    const historyId = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : null;

    // 查找并打印与该ID匹配的记录
    if (historyId) {
      const historyItem = this.data.priceHistory.find(item => item.id === historyId);
    }

    if (!historyId) {
      wx.showToast({
        title: '无法识别要删除的记录',
        icon: 'none'
      });
      return;
    }

    const productName = this.data.product.name;
    const productId = this.data.product.id;

    // 先隐藏所有滑动按钮，恢复默认状态
    const priceHistory = this.data.priceHistory.map(item => {
      item.swiping = false;
      return item;
    });
    this.setData({ priceHistory });

    // 确认删除
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该价格记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 直接删除historyId对应的产品
            const result = deleteProduct(historyId);

            if (result) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });

              // 刷新页面内容，保持筛选，并回到顶部
              setTimeout(() => {
                this.loadPriceHistory(productName, null);
                wx.pageScrollTo({
                  scrollTop: 0,
                  duration: 300
                });
              }, 500);
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  onTouchStart: function (e) {
    var touch = e.touches[0];
    this.setData({
      touchStartX: touch.clientX,
      touchStartY: touch.clientY
    });
  },

  onTouchMove: function (e) {
    var touch = e.touches[0];
    var deltaX = touch.clientX - this.data.touchStartX;
    var deltaY = touch.clientY - this.data.touchStartY;

    // 确保是水平滑动且滑动距离足够大
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      var index = e.currentTarget.dataset.index;

      if (!this.data.priceHistory || index >= this.data.priceHistory.length) {
        return;
      }

      var priceHistory = JSON.parse(JSON.stringify(this.data.priceHistory));

      // 确保每个记录都有 swiping 属性
      priceHistory.forEach((item) => {
        if (typeof item.swiping === 'undefined') {
          item.swiping = false;
        }
      });

      if (deltaX < -30) {
        // 向左滑动，显示编辑和删除按钮
        priceHistory.forEach((item, idx) => {
          item.swiping = (idx === index);
        });
        this.setData({
          priceHistory: priceHistory
        });
      } else if (deltaX > 30) {
        // 向右滑动，隐藏编辑和删除按钮
        if (priceHistory[index]) {
          priceHistory[index].swiping = false;
          this.setData({
            priceHistory: priceHistory
          });
        }
      }
    }
  },

  onTouchEnd: function (e) {
    // 触摸结束，不需要特殊处理
  },

  editHistoryItem: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/edit/edit?id=' + id
    });
  },

  // deleteHistoryItem 方法已合并到 deleteProduct 方法中
});
