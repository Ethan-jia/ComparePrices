// edit.js

Page({
    data: {
        productName: '',
        purchaseDate: '',
        location: '',
        originalPrice: '',
        currentPrice: '',
        category: '食品',
        note: '',
        isEditing: true,
        editId: null,
        createTime: '',
        updateTime: ''
    },

    onLoad: function (options) {
        // 只做初始化，不处理回显，全部交给onShow
        this.clearForm();
        this._hasEchoed = false;
        this._editIdFromOptions = options.id || null;
    },

    onShow: function () {
        // 仅首次回显，防止二次清空
        let id = this._editIdFromOptions;
        if (!id) {
            const app = getApp();
            id = app.globalData && app.globalData.editId;
        }
        if (id && (!this._hasEchoed || this.data.editId !== id)) {
            this.loadProductForEdit(id);
            this._hasEchoed = true;
        }
    },

    // 加载商品数据用于编辑
    loadProductForEdit: function (id) {
        try {
            var products = wx.getStorageSync('products') || [];
            var product = products.find(function (p) {
                return p.id === id;
            });
            if (product) {
                this.setData({
                    ...product,
                    isEditing: true,
                    editId: id,
                    productName: product.name || '',
                    purchaseDate: product.date || '',
                    location: product.location || '',
                    originalPrice: product.originalPrice === undefined ? '' : product.originalPrice,
                    currentPrice: product.currentPrice === undefined ? '' : product.currentPrice,
                    category: product.category || '食品',
                    note: product.note || '',
                    createTime: product.createTime || '',
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
                var updated = Object.assign({}, oldProduct, {
                    name: this.data.productName.trim(),
                    date: this.data.purchaseDate,
                    location: this.data.location.trim(),
                    originalPrice: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
                    currentPrice: parseFloat(this.data.currentPrice),
                    category: this.data.category,
                    note: this.data.note.trim(),
                    updateTime: Date.now()
                });
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
        this.setData({
            productName: '',
            purchaseDate: dateStr,
            location: '',
            originalPrice: '',
            currentPrice: '',
            category: '食品',
            note: '',
            isEditing: true,
            editId: null,
            createTime: '',
            updateTime: ''
        });
    }
});
