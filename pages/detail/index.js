/**
 * @deprecated 此文件已废弃，请使用 /pages/detail/detail.js 替代
 * 这是一个旧版本的详情页面，已不再使用，保留仅作参考
 */

// 废弃的 index.js
Page({
    data: {
        searchKeyword: '',
        selectedCategory: '',
        // categories 字段已移除
        products: [],
        filteredProducts: [],
        showFilter: false,
        touchStartX: 0,
        touchStartY: 0,
        currentSwipeIndex: -1
    },

    onLoad: function () {
        this.loadProducts();
    },

    onShow: function () {
        this.loadProducts();
    },

    // 加载商品数据
    loadProducts: function () {
        try {
            var products = wx.getStorageSync('products') || [];
            // 移除所有商品的category字段
            // products.forEach(function (p) { delete p.category; });
            // 为每个商品计算优惠信息
            var productsWithDiscount = products.map(function (product) {
                return this.calculateProductDiscount(product);
            }.bind(this));
            // 动态推荐筛选项（如商品名、地点、日期等，示例取前5个商品名）
            let nameSet = new Set();
            productsWithDiscount.forEach(p => nameSet.add(p.name));
            let recommend = Array.from(nameSet).slice(0, 5);
            this.setData({
                products: productsWithDiscount,
                filteredProducts: productsWithDiscount,
                // categories 字段已移除
                selectedCategory: recommend[0] || ''
            });
        } catch (error) {
            // ...existing code...
        }
    },

    // 计算商品优惠信息
    calculateProductDiscount: function (product) {
        var result = {};
        for (var key in product) {
            result[key] = product[key];
        }

        if (product.originalPrice && product.currentPrice && product.currentPrice < product.originalPrice) {
            result.showDiscount = true;
            result.savedAmount = (product.originalPrice - product.currentPrice).toFixed(2);
        } else {
            result.showDiscount = false;
            result.savedAmount = '0.00';
        }

        return result;
    },

    // 搜索功能
    onSearchInput: function (e) {
        this.setData({
            searchKeyword: e.detail.value
        });
        this.filterProducts();
    },

    // 清除搜索
    clearSearch: function () {
        this.setData({
            searchKeyword: ''
        });
        this.filterProducts();
    },

    // 选择推荐项
    selectCategory: function (e) {
        var category = e.currentTarget.dataset.category;
        // 再次点击已选项则取消筛选
        this.setData({
            selectedCategory: this.data.selectedCategory === category ? '' : category
        });
        this.filterProducts();
    },

    // 筛选商品
    filterProducts: function () {
        try {
            var filtered = this.data.products;
            // 按关键词筛选
            if (this.data.searchKeyword) {
                var keyword = this.data.searchKeyword.toLowerCase();
                filtered = filtered.filter((product) => {
                    return product.name.toLowerCase().indexOf(keyword) !== -1;
                });
            }
            // 按推荐项筛选（如商品名）
            if (this.data.selectedCategory) {
                filtered = filtered.filter((product) => {
                    return product.name === this.data.selectedCategory;
                });
            }
            this.setData({
                filteredProducts: filtered
            });
        } catch (error) {
            // ...existing code...
        }
    },

    // 切换筛选面板
    toggleFilter: function () {
        this.setData({
            showFilter: !this.data.showFilter
        });
    },

    // 跳转到添加页面
    goToAdd: function () {
        wx.switchTab({
            url: '/pages/add/add'
        });
    },

    // 跳转到详情页面
    goToDetail: function (e) {
        try {
            var index = e.currentTarget.dataset.index;
            var product = this.data.filteredProducts[index];
            if (product && !product.swiping) {
                wx.navigateTo({
                    url: '/pages/detail/detail?id=' + product.id
                });
            }
        } catch (error) {
            // ...existing code...
        }
    },

    // 触摸开始
    onTouchStart: function (e) {
        var touch = e.touches[0];
        this.setData({
            touchStartX: touch.clientX,
            touchStartY: touch.clientY
        });
    },

    // 触摸移动
    onTouchMove: function (e) {
        var touch = e.touches[0];
        var deltaX = touch.clientX - this.data.touchStartX;
        var deltaY = touch.clientY - this.data.touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            var index = e.currentTarget.dataset.index;
            var products = this.data.filteredProducts.slice();

            if (deltaX < -30) {
                // 向左滑动，显示删除按钮
                for (var i = 0; i < products.length; i++) {
                    if (i !== index) {
                        products[i].swiping = false;
                    }
                }
                products[index].swiping = true;
                this.setData({
                    filteredProducts: products,
                    currentSwipeIndex: index
                });
            } else if (deltaX > 30) {
                // 向右滑动，隐藏删除按钮
                products[index].swiping = false;
                this.setData({
                    filteredProducts: products,
                    currentSwipeIndex: -1
                });
            }
        }
    },

    // 触摸结束
    onTouchEnd: function (e) {
        // 空函数，保持接口完整
    },

    // 删除商品
    deleteProduct: function (e) {
        try {
            var index = e.currentTarget.dataset.index;
            var product = this.data.filteredProducts[index];

            wx.showModal({
                title: '确认删除',
                content: '确定要删除"' + product.name + '"吗？',
                success: function (res) {
                    if (res.confirm) {
                        var products = this.data.products.filter(function (p) {
                            return p.id !== product.id;
                        });
                        wx.setStorageSync('products', products);
                        this.loadProducts();
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });
                    }
                }.bind(this)
            });
        } catch (error) {
            // ...existing code...
        }
    },

    // 下拉刷新
    onPullDownRefresh: function () {
        this.loadProducts();
        wx.stopPullDownRefresh();
    }
});
