/**
 * 应用程序入口
 * 
 * 功能：
 * 1. 初始化应用程序
 * 2. 提供全局数据和方法
 * 3. 创建初始测试数据（如果需要）
 */

const { safeGetStorage, safeSetStorage } = require('./utils/util');

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = safeGetStorage('logs', [])
    logs.unshift(Date.now())
    safeSetStorage('logs', logs)

    // 登录
    wx.login({
      success: function (res) {
        // 登录成功
      }
    })

  },

  onShow: function () {
    // 应用显示
  },

  onHide: function () {
    // 应用隐藏
  },


  /**
   * 初始化数据
   * 只有在首次启动应用且没有数据时才会调用
   */
  initTestData: function () {
    // 这个函数保留用于未来可能的数据初始化需求
    // 已移除测试数据
  },

  globalData: {
    userInfo: null
  }
})
