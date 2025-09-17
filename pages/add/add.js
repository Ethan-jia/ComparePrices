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

Page({
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
        isSticky: false,
        allLocations: [],
        allProductNames: [],
        allBrands: [],
        showLocationDropdown: false,
        showProductNameDropdown: false,
        showBrandDropdown: false,
        currencyIndex: 0,
        currencies: CURRENCIES
    },

    onLoad: function () {
        // 设置默认币种
        const preferredCurrencyIndex = getPreferredCurrencyIndex();

        // 设置今天日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        this.setData({
            currencyIndex: preferredCurrencyIndex,
            purchaseDate: todayString
        });
    },

    onShow: function () {
        // 获取所有历史数据
        Promise.all([
            getAllProductNames(),
            getAllLocations(),
            getAllBrands()
        ]).then(([productNames, locations, brands]) => {
            this.setData({
                allProductNames: productNames,
                allLocations: locations,
                allBrands: brands
            });
        });

        // 获取预填充数据
        const app = getApp();
        if (app.globalData && app.globalData.prefilledProductName) {
            this.setData({
                productName: app.globalData.prefilledProductName,
                isSticky: app.globalData.productSticky || false
            }, () => {
            });

            // 清除全局数据
            app.globalData.prefilledProductName = null;
            app.globalData.productSticky = null;
        }
    },

    noop: function () { },

    onProductNameInput: function (e) {
        this.setData({
            productName: e.detail.value,
            showProductNameDropdown: true
        });
    },

    onSelectProductName: function (e) {
        this.setData({
            productName: e.detail.value,
            showProductNameDropdown: false
        });
    },

    onProductNameFocus: function () {
        this.setData({
            showProductNameDropdown: true
        });
    },

    onProductNameBlur: function () {
        this.setData({
            showProductNameDropdown: false
        });
    },

    onLocationInput: function (e) {
        this.setData({
            location: e.detail.value,
            showLocationDropdown: true
        });
    },

    onSelectLocation: function (e) {
        this.setData({
            location: e.detail.value,
            showLocationDropdown: false
        });
    },

    onLocationFocus: function () {
        this.setData({
            showLocationDropdown: true
        });
    },

    onLocationBlur: function () {
        this.setData({
            showLocationDropdown: false
        });
    },

    onBrandInput: function (e) {
        this.setData({
            brand: e.detail.value,
            showBrandDropdown: true
        });
    },

    onSelectBrand: function (e) {
        this.setData({
            brand: e.detail.value,
            showBrandDropdown: false
        });
    },

    onBrandFocus: function () {
        this.setData({
            showBrandDropdown: true
        });
    },

    onBrandBlur: function () {
        this.setData({
            showBrandDropdown: false
        });
    },

    onDateChange: function (e) {
        this.setData({
            purchaseDate: e.detail.value
        });
    },

    onOriginalPriceInput: function (e) {
        this.setData({
            originalPrice: e.detail.value
        });
    },

    onCurrentPriceInput: function (e) {
        this.setData({
            currentPrice: e.detail.value
        });
    },

    onNoteInput: function (e) {
        this.setData({
            note: e.detail.value
        });
    },

    onCurrencyChange: function (e) {
        const index = e.detail.value;
        this.setData({
            currencyIndex: index
        });
        savePreferredCurrency(index);
    },

    clearForm: function () {
        this.setData({
            purchaseDate: '',
            location: '',
            brand: '',
            originalPrice: '',
            currentPrice: '',
            note: '',
            isEditing: false,
            editId: null,
            isSticky: false
        });
    },

    validate: function () {
        const data = {
            name: this.data.productName,
            date: this.data.purchaseDate,
            location: this.data.location,
            brand: this.data.brand,
            originalPrice: this.data.originalPrice,
            currentPrice: this.data.currentPrice,
            note: this.data.note,
            currency: getCurrencyByIndex(this.data.currencyIndex)
        };

        const result = validateProduct(data);
        if (!result.valid) {
            wx.showToast({
                title: result.message,
                icon: 'none'
            });
            return false;
        }
        return true;
    },

    onSubmit: function () {
        if (!this.validate()) return;

        const productData = {
            name: this.data.productName,
            date: this.data.purchaseDate,
            location: this.data.location,
            brand: this.data.brand,
            originalPrice: this.data.originalPrice || undefined,
            currentPrice: this.data.currentPrice,
            note: this.data.note,
            currency: getCurrencyByIndex(this.data.currencyIndex),
            isSticky: this.data.isSticky // 保存置顶状态
        };

        try {
            if (this.data.isEditing) {
                productData.id = this.data.editId;
                updateProduct(productData);
                wx.showToast({
                    title: '更新成功',
                    icon: 'success'
                });
            } else {
                addProduct(productData);
                wx.showToast({
                    title: '添加成功',
                    icon: 'success'
                });
            }

            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/index/index'
                });
            }, 1500);
        } catch (error) {
            console.error('保存失败:', error);
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            });
        }
    }
});
