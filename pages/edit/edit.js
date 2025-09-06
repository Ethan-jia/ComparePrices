// edit.js
/**
 * 编辑商品页面
 * 
 * 功能：
 * 1. 编辑现有商品
 * 2. 自动完成输入
 * 3. 表单验证
 */

const { createProduct } = require('../../models/product');
const { getAllProductNames, getAllLocations, getAllBrands } = require('../../services/fieldService');
const {
    CURRENCIES,
    findCurrencyIndex,
    getCurrencyByIndex,
    savePreferredCurrency,
    getPreferredCurrencyIndex
} = require('../../services/currencyService');
const { getProductById, updateProduct, validateProduct } = require('../../services/productService');
Page({
    // 空方法用于阻止事件冒泡
    noop: function () { },

    // 输入商品名，支持下拉筛选 - 使用dropdown-select组件
    onProductNameInput: function (e) {
        const input = e.detail.value;
        this.setData({
            productName: input,
            showProductNameDropdown: true
        });
    },

    // 选中下拉商品名 - 使用dropdown-select组件
    onSelectProductName: function (e) {
        const name = e.detail.value;
        this.setData({
            productName: name,
            showProductNameDropdown: false
        });
    },

    // 聚焦显示下拉 - 使用dropdown-select组件
    onProductNameFocus: function () {
        this.setData({
            showProductNameDropdown: true
        });
    },

    // 失焦处理 - 使用dropdown-select组件
    onProductNameBlur: function () {
        this.setData({
            showProductNameDropdown: false
        });
    },

    // 处理页面点击事件，关闭所有下拉框
    onPageTap: function (e) {
        // 当点击页面空白区域时，关闭所有下拉框
        this.setData({
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
    },

    data: {
        productName: '',
        purchaseDate: '',
        location: '',
        brand: '',
        originalPrice: '',
        currentPrice: '',
        note: '',
        isEditing: true,
        editId: null,
        allProductNames: [], // 所有历史商品名称
        allLocations: [], // 所有历史地点
        allBrands: [], // 所有历史品牌
        showProductNameDropdown: false, // 是否显示商品名称下拉
        showLocationDropdown: false, // 是否显示地点下拉
        showBrandDropdown: false, // 是否显示品牌下拉
        // 货币选择相关
        currencyIndex: 0, // 默认值会在onLoad时更新为用户首选货币
        currencies: CURRENCIES
    },

    onLoad: function (options) {
        // 获取用户首选货币索引
        const preferredCurrencyIndex = getPreferredCurrencyIndex();

        // 初始化表单并应用首选货币
        this.clearForm();

        // 除非编辑现有商品，否则设置货币索引为用户首选货币
        if (!options.id) {
            this.setData({
                currencyIndex: preferredCurrencyIndex
            });
        }

        this._hasEchoed = false;
        this._editIdFromOptions = options.id || null;
    },

    onShow: function () {
        // 获取所有历史数据
        const allProductNames = getAllProductNames();
        const allLocations = getAllLocations();
        const allBrands = getAllBrands();

        // 统一设置数据
        this.setData({
            allProductNames,
            allLocations,
            allBrands,
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
        // 回显逻辑：优先用 options.id，其次用全局变量
        let editId = this._editIdFromOptions;
        if (!editId) {
            const app = getApp();
            if (app.globalData && app.globalData.editProduct && app.globalData.editProduct.id) {
                editId = app.globalData.editProduct.id;
            }
        }
        if (editId) {
            this.loadProductForEdit(editId);
        }
    },

    // 输入地点，支持下拉筛选 - 使用dropdown-select组件
    onLocationInput: function (e) {
        const input = e.detail.value;
        this.setData({
            location: input,
            showLocationDropdown: true
        });
    },

    // 选中下拉地点 - 使用dropdown-select组件
    onSelectLocation: function (e) {
        const location = e.detail.value;
        this.setData({
            location: location,
            showLocationDropdown: false
        });
    },

    // 聚焦显示下拉 - 使用dropdown-select组件
    onLocationFocus: function () {
        this.setData({
            showLocationDropdown: true
        });
    },

    // 失焦处理 - 使用dropdown-select组件
    onLocationBlur: function () {
        this.setData({
            showLocationDropdown: false
        });
    },

    // 仅首次回显，防止二次清空
    // 注意：此逻辑应属于 onShow 方法体
    // 这里补回 onShow 的后续逻辑
    // 由于 onShow 已经 return，需手动补回

    /**
     * 加载商品数据用于编辑
     * @param {string} id - 商品ID
     */
    loadProductForEdit: function (id) {
        try {
            // 使用productService获取商品详情
            const product = getProductById(id);

            if (product) {
                // 查找匹配的货币索引
                const currencyIndex = findCurrencyIndex(product.currency);

                // 设置表单数据，回显商品信息
                this.setData({
                    isEditing: true,
                    editId: id,
                    productName: product.name || '',
                    purchaseDate: product.date || '',
                    location: product.location || '',
                    brand: product.brand || '',
                    // 处理数值类型，避免显示undefined
                    originalPrice: product.originalPrice === undefined ? '' : product.originalPrice,
                    currentPrice: product.currentPrice === undefined ? '' : product.currentPrice,
                    note: product.note || '',
                    createTime: product.createTime || '',
                    currencyIndex: currencyIndex,
                    updateTime: product.updateTime || ''
                });

                this._hasEchoed = true; // 标记已经回显过数据
            } else {
                // 商品不存在，显示提示并返回
                wx.showToast({
                    title: '商品不存在或已被删除',
                    icon: 'none'
                });
                setTimeout(() => wx.navigateBack(), 1500);
            }
        } catch (error) {
            wx.showToast({ title: '加载失败', icon: 'none' });
        }
    },
    // 输入品牌，支持下拉筛选 - 使用dropdown-select组件
    onBrandInput: function (e) {
        const input = e.detail.value;
        this.setData({
            brand: input,
            showBrandDropdown: true
        });
    },

    // 选中下拉品牌 - 使用dropdown-select组件
    onSelectBrand: function (e) {
        const brand = e.detail.value;
        this.setData({
            brand: brand,
            showBrandDropdown: false
        });
    },

    // 聚焦显示下拉 - 使用dropdown-select组件
    onBrandFocus: function () {
        this.setData({
            showBrandDropdown: true
        });
    },

    // 失焦处理 - 使用dropdown-select组件
    onBrandBlur: function () {
        this.setData({
            showBrandDropdown: false
        });
    },

    // 输入事件
    onNameInput: function (e) {
        this.setData({ productName: e.detail.value });
    },
    onDateChange: function (e) {
        this.setData({ purchaseDate: e.detail.value });
    },
    onLocationInput: function (e) {
        this.setData({ location: e.detail.value });
    },
    onOriginalPriceInput: function (e) {
        this.setData({ originalPrice: e.detail.value });
    },
    onCurrentPriceInput: function (e) {
        this.setData({ currentPrice: e.detail.value });
    },
    onNoteInput: function (e) {
        this.setData({ note: e.detail.value });
    },
    // 货币选择变化
    onCurrencyChange: function (e) {
        const index = e.detail.value;
        this.setData({
            currencyIndex: index
        });

        // 保存用户选择的货币作为首选
        const currency = getCurrencyByIndex(index);
        savePreferredCurrency(currency.code);
    },

    /**
     * 保存编辑后的商品数据
     * 使用productService处理数据存储逻辑
     */
    saveProduct: function () {
        // 准备商品数据对象，进行基本处理
        const productData = {
            name: this.data.productName.trim(),
            date: this.data.purchaseDate,
            location: this.data.location.trim(),
            brand: this.data.brand.trim(),
            originalPrice: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
            currentPrice: parseFloat(this.data.currentPrice),
            note: (this.data.note || '').trim(),
            currency: getCurrencyByIndex(this.data.currencyIndex)
        };

        // 使用服务层验证表单数据
        const validation = validateProduct(productData);
        if (!validation.valid) {
            wx.showToast({
                title: validation.errors[0] || '表单验证失败',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        try {
            // 确保有编辑ID
            if (!this.data.editId) {
                throw new Error('商品ID不存在，无法更新');
            }

            // 更新现有商品
            const result = updateProduct(this.data.editId, productData);

            if (!result) {
                throw new Error('更新商品失败，请检查数据并重试');
            }

            // 操作成功，显示提示
            wx.showToast({
                title: '更新成功',
                icon: 'success',
                duration: 1500
            });

            // 保存后跳回详情页或首页
            setTimeout(() => {
                // 检查来源页面，决定跳转行为
                const pages = getCurrentPages();

                // 如果上一页是详情页，则返回详情页并刷新
                if (pages.length > 1 && pages[pages.length - 2].route === 'pages/detail/detail') {
                    // 回到详情页并刷新
                    wx.navigateBack({
                        success: function () {
                            // 通知详情页刷新数据
                            const detailPage = getCurrentPages()[getCurrentPages().length - 1];
                            if (detailPage && detailPage.onLoad) {
                                detailPage.onLoad({ id: this.data.editId });
                            }
                        }.bind(this)
                    });
                } else {
                    // 回到首页（如果不是从详情页来）
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }
            }, 1500);
        } catch (error) {
            // 错误处理：显示详细的错误信息
            console.error('保存商品失败:', error);

            wx.showToast({
                title: error.message || '保存失败，请重试',
                icon: 'none',
                duration: 2500
            });
        }
    },

    /**
     * 清空表单数据，重置为初始状态
     * 用于用户主动清空表单
     */
    clearForm: function () {
        // 设置今天日期为默认日期
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // 获取用户首选货币索引
        const preferredCurrencyIndex = getPreferredCurrencyIndex();

        this.setData({
            productName: '',
            purchaseDate: dateStr,
            location: '',
            brand: '',
            originalPrice: '',
            currentPrice: '',
            note: '',
            // 在编辑页面保持编辑状态
            isEditing: true,
            editId: null,
            currencyIndex: preferredCurrencyIndex, // 使用用户首选货币
            createTime: '',
            updateTime: '',
            // 确保下拉框关闭
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
    }
});
