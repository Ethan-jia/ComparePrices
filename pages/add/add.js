// add.js
Page({
    data: {
        productName: '',
        purchaseDate: '',
        location: '',
        originalPrice: '',
        currentPrice: '',
        category: '食品',
        note: '',
        // categories 字段已移除
        showCategoryPicker: false,
        isEditing: false,
        editId: null
    },

    onLoad: function (options) {
        // 只做初始化，不处理编辑回显，全部交给onShow
        this.clearForm();
    },

    onShow: function () {
        // 仅编辑跳转时回显，其它场景始终新增
        const app = getApp();
        const editProduct = app.globalData && app.globalData.editProduct;
        // console.log('[add.js onShow] editProduct:', editProduct);
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
                    originalPrice: editProduct.originalPrice === undefined ? '' : editProduct.originalPrice,
                    currentPrice: editProduct.currentPrice === undefined ? '' : editProduct.currentPrice,
                    category: editProduct.category || '食品',
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
                    category: product.category || '食品',
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

    // 输入地点
    onLocationInput: function (e) {
        this.setData({
            location: e.detail.value
        });
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
                    // 用 Object.assign 合并，保留所有原字段
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
                }
            } else {
                // 新增模式：添加新商品
                var productData = {
                    id: this.generateId(),
                    name: this.data.productName.trim(),
                    date: this.data.purchaseDate,
                    location: this.data.location.trim(),
                    originalPrice: this.data.originalPrice ? parseFloat(this.data.originalPrice) : null,
                    currentPrice: parseFloat(this.data.currentPrice),
                    category: this.data.category,
                    note: this.data.note.trim(),
                    createTime: Date.now(),
                    updateTime: Date.now()
                };
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
        this.setData({
            productName: '',
            purchaseDate: dateStr,
            location: '',
            originalPrice: '',
            currentPrice: '',
            category: '食品',
            note: '',
            isEditing: false,
            editId: null,
            createTime: '',
            updateTime: ''
        });
    }
});
