// edit.js

const { createProduct } = require('../../models/product');
const { getAllProductNames, getAllLocations, getAllBrands } = require('../../services/fieldService');
const {
    CURRENCIES,
    findCurrencyIndex,
    getCurrencyByIndex,
    savePreferredCurrency,
    getPreferredCurrencyIndex
} = require('../../services/currencyService');
const autoComplete = require('../../utils/autoComplete');
Page({
    // 输入商品名，支持下拉筛选
    onProductNameInput: function (e) {
        const input = e.detail.value;
        const filtered = autoComplete.filterList(input, this.data.allProductNames);
        this.setData({
            productName: input,
            filteredProductNames: filtered,
            showProductNameDropdown: autoComplete.shouldShowDropdown(input, filtered)
        });
    },

    // 选中下拉商品名
    onSelectProductName: function (e) {
        const name = e.currentTarget.dataset.name;
        this.setData({
            productName: name,
            showProductNameDropdown: false
        });
    },

    // 聚焦显示下拉
    onProductNameFocus: function () {
        let filtered;
        if (this.data.productName) {
            filtered = autoComplete.filterList(this.data.productName, this.data.allProductNames);
        } else {
            filtered = this.data.allProductNames;
        }
        this.setData({
            filteredProductNames: filtered,
            showProductNameDropdown: !!filtered.length
        });
    },

    // 失焦隐藏下拉（延迟，避免点击事件被吞）
    onProductNameBlur: function () {
        setTimeout(() => {
            this.setData({ showProductNameDropdown: false });
        }, 200);
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
        createTime: '',
        updateTime: '',
        allBrands: [],
        filteredBrands: [],
        showBrandDropdown: false,
        allLocations: [],
        filteredLocations: [],
        showLocationDropdown: false,
        // 货币选择相关
        currencyIndex: 0, // 默认选择人民币
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
        // 统一获取品牌、商品名、地点
        const allBrands = getAllBrands();
        const allProductNames = getAllProductNames();
        const allLocations = getAllLocations();
        this.setData({
            allProductNames,
            filteredProductNames: allProductNames,
            showProductNameDropdown: false,
            allBrands,
            filteredBrands: allBrands,
            showBrandDropdown: false,
            allLocations,
            filteredLocations: allLocations,
            showLocationDropdown: false
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

    // 输入购买地点，支持下拉筛选
    onLocationInput: function (e) {
        const input = e.detail.value;
        const filtered = autoComplete.filterList(input, this.data.allLocations);
        this.setData({
            location: input,
            filteredLocations: filtered,
            showLocationDropdown: autoComplete.shouldShowDropdown(input, filtered)
        });
    },

    // 选中下拉地点
    onSelectLocation: function (e) {
        const loc = e.currentTarget.dataset.location;
        this.setData({
            location: loc,
            showLocationDropdown: false
        });
    },

    // 聚焦显示下拉
    onLocationFocus: function () {
        let filtered;
        if (this.data.location) {
            filtered = autoComplete.filterList(this.data.location, this.data.allLocations);
        } else {
            filtered = this.data.allLocations;
        }
        this.setData({
            filteredLocations: filtered,
            showLocationDropdown: !!filtered.length
        });
    },

    // 失焦隐藏下拉（延迟，避免点击事件被吞）
    onLocationBlur: function () {
        setTimeout(() => {
            this.setData({ showLocationDropdown: false });
        }, 200);
    },

    // 仅首次回显，防止二次清空
    // 注意：此逻辑应属于 onShow 方法体
    // 这里补回 onShow 的后续逻辑
    // 由于 onShow 已经 return，需手动补回

    // 加载商品数据用于编辑
    loadProductForEdit: function (id) {
        try {
            var products = wx.getStorageSync('products') || [];
            var product = products.find(function (p) {
                return p.id === id;
            });
            if (product) {
                // 处理货币信息
                const currencyIndex = findCurrencyIndex(product.currency);

                this.setData({
                    ...product,
                    isEditing: true,
                    editId: id,
                    productName: product.name || '',
                    purchaseDate: product.date || '',
                    location: product.location || '',
                    brand: product.brand || '',
                    originalPrice: product.originalPrice === undefined ? '' : product.originalPrice,
                    currentPrice: product.currentPrice === undefined ? '' : product.currentPrice,
                    // category 字段已移除
                    note: product.note || '',
                    createTime: product.createTime || '',
                    currencyIndex: currencyIndex,
                    updateTime: product.updateTime || ''
                });
            } else {
                wx.showToast({ title: '商品不存在', icon: 'none' });
                setTimeout(() => wx.navigateBack(), 1500);
            }
        } catch (error) {
            wx.showToast({ title: '加载失败', icon: 'none' });
        }
    },
    // 输入品牌，支持下拉筛选
    onBrandInput: function (e) {
        const input = e.detail.value;
        const filtered = autoComplete.filterList(input, this.data.allBrands);
        this.setData({
            brand: input,
            filteredBrands: filtered,
            showBrandDropdown: autoComplete.shouldShowDropdown(input, filtered)
        });
    },

    // 选中下拉品牌
    onSelectBrand: function (e) {
        const brand = e.currentTarget.dataset.brand;
        this.setData({
            brand: brand,
            showBrandDropdown: false
        });
    },

    // 聚焦显示下拉
    onBrandFocus: function () {
        let filtered;
        if (this.data.brand) {
            filtered = autoComplete.filterList(this.data.brand, this.data.allBrands);
        } else {
            filtered = this.data.allBrands;
        }
        this.setData({
            filteredBrands: filtered,
            showBrandDropdown: !!filtered.length
        });
    },

    // 失焦隐藏下拉（延迟，避免点击事件被吞）
    onBrandBlur: function () {
        setTimeout(() => {
            this.setData({ showBrandDropdown: false });
        }, 200);
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

    // 保存编辑
    saveProduct: function () {
        if (!this.validateForm()) {
            return;
        }
        try {
            var products = wx.getStorageSync('products') || [];
            var index = products.findIndex(function (p) {
                return p.id === this.data.editId;
            }.bind(this));
            if (index !== -1) {
                var oldProduct = products[index];
                var updated = createProduct(Object.assign({}, oldProduct, {
                    name: this.data.productName.trim(),
                    date: this.data.purchaseDate,
                    location: this.data.location.trim(),
                    brand: this.data.brand.trim(),
                    originalPrice: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
                    currentPrice: parseFloat(this.data.currentPrice),
                    // category 字段已移除
                    note: this.data.note.trim(),
                    currency: getCurrencyByIndex(this.data.currencyIndex),
                    updateTime: Date.now()
                }));
                products[index] = updated;
                wx.setStorageSync('products', products);
                wx.showToast({ title: '更新成功', icon: 'success', duration: 1200 });
                // 1. 保存后跳回详情页
                setTimeout(() => {
                    // 2. 让首页刷新（可用事件或全局变量，简单用事件）
                    const pages = getCurrentPages();
                    if (pages.length > 1 && pages[pages.length - 2].route === 'pages/detail/detail') {
                        // 回到详情页并刷新
                        wx.navigateBack({
                            success: function () {
                                // 通知详情页刷新
                                const detailPage = getCurrentPages()[getCurrentPages().length - 1];
                                if (detailPage && detailPage.onLoad) {
                                    detailPage.onLoad({ id: updated.id });
                                }
                            }
                        });
                    } else {
                        // 回到首页
                        wx.switchTab({ url: '/pages/index/index' });
                    }
                }, 1200);
            } else {
                wx.showToast({ title: '商品不存在', icon: 'none' });
            }
        } catch (error) {
            wx.showToast({ title: '保存失败', icon: 'none' });
        }
    },

    // 表单验证
    validateForm: function () {
        if (!this.data.productName.trim()) {
            wx.showToast({ title: '请输入商品名称', icon: 'none' });
            return false;
        }
        if (!this.data.purchaseDate) {
            wx.showToast({ title: '请选择购买日期', icon: 'none' });
            return false;
        }
        if (!this.data.location.trim()) {
            wx.showToast({ title: '请输入购买地点', icon: 'none' });
            return false;
        }
        if (!this.data.currentPrice || parseFloat(this.data.currentPrice) <= 0) {
            wx.showToast({ title: '请输入有效的现价', icon: 'none' });
            return false;
        }
        if (this.data.originalPrice && parseFloat(this.data.originalPrice) <= 0) {
            wx.showToast({ title: '请输入有效的原价', icon: 'none' });
            return false;
        }
        return true;
    },

    // 清空表单
    clearForm: function () {
        var today = new Date();
        var dateStr = today.toISOString().split('T')[0];

        // 获取用户首选货币索引
        const preferredCurrencyIndex = getPreferredCurrencyIndex();

        this.setData({
            productName: '',
            purchaseDate: dateStr,
            location: '',
            brand: '',
            originalPrice: '',
            currentPrice: '',
            // category 字段已移除
            note: '',
            isEditing: true,
            editId: null,
            currencyIndex: preferredCurrencyIndex, // 使用用户首选货币
            createTime: '',
            updateTime: ''
        });
    }
});
