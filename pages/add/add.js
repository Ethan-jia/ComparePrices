/**
 * 添加/编辑商品页面
 * 
 * 功能：
 * 1. 添加新商品
 * 2. 编辑现有商品
 * 3. 自动完成输入建议
 * 4. 表单验证
 * 5. 使用自定义组件：dropdown-select和price-input
 * 6. 货币选择
 */

const { createProduct } = require('../../models/product');
const { getAllProductNames, getAllLocations, getAllBrands } = require('../../services/fieldService');
const {
    CURRENCIES,
    getDefaultCurrency,
    getCurrencyByIndex,
    savePreferredCurrency,
    getPreferredCurrencyIndex,
    findCurrencyIndex
} = require('../../services/currencyService');
const {
    addProduct,
    updateProduct,
    validateProduct,
    getProductById
} = require('../../services/productService');
const autoComplete = require('../../utils/autoComplete');
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
    data: {
        productName: '',
        purchaseDate: '',
        location: '',
        brand: '',
        originalPrice: '',
        currentPrice: '',
        note: '',
        isEditing: false,
        editId: null,
        allLocations: [], // 所有历史地点
        allProductNames: [], // 所有历史商品名称
        allBrands: [], // 所有历史品牌
        showLocationDropdown: false, // 是否显示地点下拉
        showProductNameDropdown: false, // 是否显示商品名称下拉
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

        // 设置货币索引为用户首选货币
        this.setData({
            currencyIndex: preferredCurrencyIndex
        });
    },

    onShow: function () {
        // 仅编辑跳转时回显，其它场景始终新增
        const app = getApp();
        const editProduct = app.globalData && app.globalData.editProduct;
        // 检查是否有预填充的商品名称
        const prefilledProductName = app.globalData && app.globalData.prefilledProductName;

        // 获取所有历史数据
        const allProductNames = getAllProductNames();
        const allLocations = getAllLocations();
        const allBrands = getAllBrands();

        // 如果有预填充的商品名称，则设置
        if (prefilledProductName) {
            this.setData({
                productName: prefilledProductName
            });
            // 使用后清除，避免重复使用
            app.globalData.prefilledProductName = null;
        }

        // 统一设置数据
        this.setData({
            allProductNames,
            allLocations,
            allBrands,
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
        if (editProduct && editProduct.id) {
            // 防止二次清空：加锁标记
            if (!this._hasEchoed || this.data.editId !== editProduct.id) {
                this.setData({
                    ...editProduct,
                    isEditing: true,
                    editId: editProduct.id,
                    productName: editProduct.name || '',
                    purchaseDate: editProduct.date || '',
                    location: editProduct.location || '',
                    brand: editProduct.brand || '',
                    originalPrice: editProduct.originalPrice === undefined ? '' : editProduct.originalPrice,
                    currentPrice: editProduct.currentPrice === undefined ? '' : editProduct.currentPrice,
                    // category 字段已移除
                    note: editProduct.note || ''
                });
                this._hasEchoed = true;
            }
            app.globalData.editProduct = null;
        } else {
            this._hasEchoed = false;
            this.clearForm();
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
                    originalPrice: product.originalPrice === undefined ? '' : product.originalPrice,
                    currentPrice: product.currentPrice === undefined ? '' : product.currentPrice,
                    note: product.note || '',
                    currencyIndex: currencyIndex,
                    createTime: product.createTime || '',
                    updateTime: product.updateTime || ''
                });
            }
        } catch (error) {
            console.error('加载商品数据失败:', error);
            wx.showToast({
                title: '加载数据失败',
                icon: 'none'
            });
        }
    },

    // 输入商品名称
    onNameInput: function (e) {
        this.setData({
            productName: e.detail.value
        });
    },

    // 选择日期
    onDateChange: function (e) {
        this.setData({
            purchaseDate: e.detail.value
        });
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

    // 输入原价 - 使用price-input组件
    onOriginalPriceInput: function (e) {
        this.setData({
            originalPrice: e.detail.value
        });
    },

    // 输入现价 - 使用price-input组件
    onCurrentPriceInput: function (e) {
        this.setData({
            currentPrice: e.detail.value
        });
    },

    // 输入备注
    onNoteInput: function (e) {
        this.setData({
            note: e.detail.value
        });
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

    // 分类相关方法已移除

    /**
     * 保存商品数据
     * 根据isEditing状态决定是添加新商品还是更新现有商品
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
            // 根据编辑状态调用不同的服务函数
            let result = false;

            if (this.data.isEditing) {
                // 编辑模式：更新现有商品
                result = updateProduct(this.data.editId, productData);

                if (!result) {
                    throw new Error('更新商品失败，请检查数据并重试');
                }
            } else {
                // 新增模式：添加新商品
                result = addProduct(productData);

                if (!result) {
                    throw new Error('添加商品失败，请检查数据并重试');
                }
            }

            // 操作成功，显示提示
            wx.showToast({
                title: this.data.isEditing ? '更新成功' : '添加成功',
                icon: 'success',
                duration: 2000
            });

            // 清空表单数据
            this.clearForm();

            // 返回首页
            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/index/index'
                });
            }, 2000);

        } catch (error) {
            // 记录详细错误信息
            console.error('保存商品失败:', error);

            // 向用户展示友好的错误提示
            wx.showToast({
                title: error.message || '保存失败，请重试',
                icon: 'none',
                duration: 3000
            });
        }
    },

    // 表单验证 - 已移至productService
    // 使用validateProduct函数替代

    // 清空表单
    /**
     * 清空表单数据，重置为初始状态
     * 用于添加完成后或用户主动清空表单
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
            isEditing: false,
            editId: null,
            currencyIndex: preferredCurrencyIndex, // 使用用户首选货币
            createTime: '',
            updateTime: '',
            // 确保下拉框关闭
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
    },

    // 空方法，用于阻止事件冒泡，确保点击下拉框不会触发外层的点击事件
    noop: function () {
        // 不做任何事情
    },

    // 处理页面点击事件，关闭所有下拉框
    onPageTap: function (e) {
        // 当点击页面空白区域时，关闭所有下拉框
        this.setData({
            showProductNameDropdown: false,
            showLocationDropdown: false,
            showBrandDropdown: false
        });
    }
});
