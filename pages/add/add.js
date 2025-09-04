// add.js
const { createProduct } = require('../../models/product');
const { getAllProductNames, getAllLocations, getAllBrands } = require('../../services/fieldService');
const {
    CURRENCIES,
    getDefaultCurrency,
    getCurrencyByIndex,
    savePreferredCurrency,
    getPreferredCurrencyIndex
} = require('../../services/currencyService');
const autoComplete = require('../../utils/autoComplete');
Page({
    // 输入商品名，支持下拉筛选
    onProductNameInput: function (e) {
        const input = e.detail.value;
        const filtered = this.data.allProductNames.filter(name => name.indexOf(input) !== -1);
        this.setData({
            productName: input,
            filteredProductNames: filtered,
            showProductNameDropdown: !!(filtered.length && input)
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
        if (this.data.productName) {
            const filtered = autoComplete.filterList(this.data.productName, this.data.allProductNames);
            this.setData({
                filteredProductNames: filtered,
                showProductNameDropdown: !!filtered.length
            });
        } else {
            this.setData({
                filteredProductNames: this.data.allProductNames,
                showProductNameDropdown: !!this.data.allProductNames.length
            });
        }
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
        isEditing: false,
        editId: null,
        allLocations: [], // 所有历史地点
        filteredLocations: [], // 筛选后的地点
        showLocationDropdown: false, // 是否显示下拉
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
        // 统计所有历史商品名
        const allProductNames = getAllProductNames();
        const allLocations = getAllLocations();
        this.setData({
            allProductNames,
            filteredProductNames: allProductNames,
            showProductNameDropdown: false
        });
        // 统一获取品牌
        const allBrands = getAllBrands();
        this.setData({
            allLocations,
            filteredLocations: allLocations,
            showLocationDropdown: false,
            allBrands,
            filteredBrands: allBrands,
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
    // 输入品牌，支持下拉筛选
    onBrandInput: function (e) {
        const input = e.detail.value;
        const filtered = this.data.allBrands.filter(brand => brand.indexOf(input) !== -1);
        this.setData({
            brand: input,
            filteredBrands: filtered,
            showBrandDropdown: !!(filtered.length && input)
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
        if (this.data.brand) {
            const filtered = autoComplete.filterList(this.data.brand, this.data.allBrands);
            this.setData({
                filteredBrands: filtered,
                showBrandDropdown: !!filtered.length
            });
        } else {
            this.setData({
                filteredBrands: this.data.allBrands,
                showBrandDropdown: !!this.data.allBrands.length
            });
        }
    },

    // 失焦隐藏下拉（延迟，避免点击事件被吞）
    onBrandBlur: function () {
        setTimeout(() => {
            this.setData({ showBrandDropdown: false });
        }, 200);
    },
    // 输入品牌
    onBrandInput: function (e) {
        this.setData({
            brand: e.detail.value
        });
    },

    // 加载商品数据用于编辑
    loadProductForEdit: function (id) {
        try {
            var products = wx.getStorageSync('products') || [];
            var product = products.find(function (p) {
                return p.id === id;
            });
            if (product) {
                // 直接展开所有字段，保证回显完整
                this.setData({
                    ...product,
                    isEditing: true,
                    editId: id,
                    productName: product.name || '',
                    purchaseDate: product.date || '',
                    location: product.location || '',
                    originalPrice: product.originalPrice === undefined ? '' : product.originalPrice,
                    currentPrice: product.currentPrice === undefined ? '' : product.currentPrice,
                    // category 字段已移除
                    note: product.note || ''
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

    // 输入地点，支持下拉筛选
    onLocationInput: function (e) {
        const input = e.detail.value;
        const filtered = this.data.allLocations.filter(loc => loc.indexOf(input) !== -1);
        this.setData({
            location: input,
            filteredLocations: filtered,
            showLocationDropdown: !!(filtered.length && input)
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
        if (this.data.location) {
            const filtered = autoComplete.filterList(this.data.location, this.data.allLocations);
            this.setData({
                filteredLocations: filtered,
                showLocationDropdown: !!filtered.length
            });
        } else {
            this.setData({
                filteredLocations: this.data.allLocations,
                showLocationDropdown: !!this.data.allLocations.length
            });
        }
    },

    // 失焦隐藏下拉（延迟，避免点击事件被吞）
    onLocationBlur: function () {
        setTimeout(() => {
            this.setData({ showLocationDropdown: false });
        }, 200);
    },

    // 输入原价
    onOriginalPriceInput: function (e) {
        this.setData({
            originalPrice: e.detail.value
        });
    },

    // 输入现价
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

    // 保存商品
    saveProduct: function () {
        if (!this.validateForm()) {
            return;
        }
        try {
            var products = wx.getStorageSync('products') || [];
            if (this.data.isEditing) {
                // 编辑模式：合并原商品所有字段，仅更新表单相关字段
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
                        currency: this.data.currencies[this.data.currencyIndex],
                        updateTime: Date.now()
                    }));
                    products[index] = updated;
                }
            } else {
                // 新增模式：添加新商品
                var productData = createProduct({
                    id: this.generateId(),
                    name: this.data.productName.trim(),
                    date: this.data.purchaseDate,
                    location: this.data.location.trim(),
                    brand: this.data.brand.trim(),
                    originalPrice: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
                    currentPrice: parseFloat(this.data.currentPrice),
                    // category 字段已移除
                    note: this.data.note.trim(),
                    currency: getCurrencyByIndex(this.data.currencyIndex),
                    createTime: Date.now(),
                    updateTime: Date.now()
                });
                products.push(productData);
            }
            wx.setStorageSync('products', products);
            wx.showToast({
                title: this.data.isEditing ? '更新成功' : '添加成功',
                icon: 'success',
                duration: 2000
            });
            setTimeout(function () {
                wx.switchTab({
                    url: '/pages/index/index'
                });
            }.bind(this), 2000);
        } catch (error) {
            console.error('保存商品失败:', error);
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            });
        }
    },

    // 表单验证
    validateForm: function () {
        if (!this.data.productName.trim()) {
            wx.showToast({
                title: '请输入商品名称',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.purchaseDate) {
            wx.showToast({
                title: '请选择购买日期',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.location.trim()) {
            wx.showToast({
                title: '请输入购买地点',
                icon: 'none'
            });
            return false;
        }

        if (!this.data.currentPrice || parseFloat(this.data.currentPrice) <= 0) {
            wx.showToast({
                title: '请输入有效的现价',
                icon: 'none'
            });
            return false;
        }

        if (this.data.originalPrice && parseFloat(this.data.originalPrice) <= 0) {
            wx.showToast({
                title: '请输入有效的原价',
                icon: 'none'
            });
            return false;
        }

        return true;
    },

    // 生成唯一ID
    generateId: function () {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            isEditing: false,
            editId: null,
            currencyIndex: preferredCurrencyIndex, // 使用用户首选货币
            createTime: '',
            updateTime: ''
        });
    }
});
