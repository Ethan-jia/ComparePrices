// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: function (res) {
        console.log('登录成功', res)
      }
    })

  },

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
  },


  // 初始化测试数据
  initTestData: function () {
    try {
      var products = wx.getStorageSync('products')
      if (!products || products.length === 0) {
        var testData = [
          {
            id: 'test1',
            name: '牛奶',
            date: '2024-01-15',
            location: '超市A',
            originalPrice: 8.5,
            currentPrice: 6.9,
            category: '食品',
            note: '特价促销',
            createTime: Date.now(),
            updateTime: Date.now()
          },
          {
            id: 'test2',
            name: '苹果',
            date: '2024-01-16',
            location: '水果店',
            originalPrice: null,
            currentPrice: 12.8,
            category: '食品',
            note: '新鲜红富士',
            createTime: Date.now(),
            updateTime: Date.now()
          },
          {
            id: 'test3',
            name: '洗发水',
            date: '2024-01-17',
            location: '超市B',
            originalPrice: 45.0,
            currentPrice: 35.0,
            category: '日用品',
            note: '买一送一',
            createTime: Date.now(),
            updateTime: Date.now()
          }
        ]
        wx.setStorageSync('products', testData)
        console.log('测试数据初始化完成')
      }
    } catch (error) {
      console.error('初始化测试数据失败:', error)
    }
  },

  globalData: {
    userInfo: null
  }
})
