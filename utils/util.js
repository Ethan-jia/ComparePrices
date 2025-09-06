// utils/util.js

// 格式化时间
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : `0${n}`
}

// 安全的数据获取函数
const safeGetStorage = (key, defaultValue = null) => {
    try {
        const value = wx.getStorageSync(key)
        return value !== '' ? value : defaultValue
    } catch (error) {
        // 数据获取失败，返回默认值
        return defaultValue
    }
}

// 安全的数据设置函数
const safeSetStorage = (key, value) => {
    try {
        wx.setStorageSync(key, value)
        return true
    } catch (error) {
        // 数据设置失败
        return false
    }
}

// 显示错误提示
const showError = (message, duration = 2000) => {
    wx.showToast({
        title: message,
        icon: 'none',
        duration: duration
    })
}

// 显示成功提示
const showSuccess = (message, duration = 2000) => {
    wx.showToast({
        title: message,
        icon: 'success',
        duration: duration
    })
}

// 确认对话框
const showConfirm = (title, content) => {
    return new Promise((resolve) => {
        wx.showModal({
            title: title,
            content: content,
            success: (res) => {
                resolve(res.confirm)
            },
            fail: () => {
                resolve(false)
            }
        })
    })
}

// 生成唯一ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化价格
const formatPrice = (price) => {
    if (typeof price !== 'number') {
        return '0.00'
    }
    return price.toFixed(2)
}

// 计算优惠幅度
const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice || originalPrice <= 0 || currentPrice <= 0) {
        return 0
    }
    return ((originalPrice - currentPrice) / originalPrice * 100).toFixed(1)
}

module.exports = {
    formatTime,
    formatNumber,
    safeGetStorage,
    safeSetStorage,
    showError,
    showSuccess,
    showConfirm,
    generateId,
    formatPrice,
    calculateDiscount
}
