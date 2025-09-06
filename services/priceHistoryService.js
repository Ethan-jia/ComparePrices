/**
 * 价格历史服务
 * 
 * 提供价格历史相关的功能，包括添加、查询和分析价格历史数据
 */

const productService = require('./productService');

/**
 * 为商品添加价格历史记录
 * 
 * @param {String} productId - 商品ID
 * @param {Object} priceRecord - 价格记录对象
 * @param {Number} priceRecord.price - 价格值
 * @param {String} priceRecord.date - 日期字符串 YYYY-MM-DD格式
 * @param {Object} priceRecord.currency - 货币对象，包含code、symbol等字段
 * @param {String} [priceRecord.location] - 可选，购买地点
 * @param {String} [priceRecord.note] - 可选，备注
 * @returns {Boolean} - 添加是否成功
 */
function addPriceHistory(productId, priceRecord) {
    try {
        const products = productService.getAllProducts();

        // 查找产品索引
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            console.error('未找到指定ID的商品:', productId);
            return false;
        }

        // 确保价格历史记录存在
        if (!products[productIndex].priceHistory) {
            products[productIndex].priceHistory = [];
        }

        // 创建完整的价格历史记录
        const historyRecord = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2), // 生成唯一ID
            price: priceRecord.price,
            date: priceRecord.date,
            currency: priceRecord.currency,
            location: priceRecord.location || products[productIndex].location,
            note: priceRecord.note || '',
            createTime: Date.now()
        };

        // 添加到价格历史
        products[productIndex].priceHistory.push(historyRecord);

        // 更新商品当前价格
        products[productIndex].currentPrice = priceRecord.price;
        products[productIndex].updateTime = Date.now();

        // 保存更新后的商品数据
        productService.saveAllProducts(products);
        return true;
    } catch (error) {
        console.error('添加价格历史失败:', error);
        return false;
    }
}

/**
 * 获取商品的价格历史
 * 
 * @param {String} productId - 商品ID
 * @returns {Array} - 价格历史记录数组，按日期降序排列
 */
function getPriceHistory(productId) {
    try {
        const products = productService.getAllProducts();
        const product = products.find(p => p.id === productId);

        if (!product || !product.priceHistory) {
            return [];
        }

        // 复制价格历史数组，避免修改原始数据
        const history = [...product.priceHistory];

        // 按日期降序排序
        return history.sort((a, b) => {
            // 先按日期排序
            const dateComparison = new Date(b.date) - new Date(a.date);
            if (dateComparison !== 0) return dateComparison;

            // 如果日期相同，按创建时间排序
            return b.createTime - a.createTime;
        });
    } catch (error) {
        console.error('获取价格历史失败:', error);
        return [];
    }
}

/**
 * 获取同名商品的所有价格历史
 * 
 * @param {String} productName - 商品名称
 * @returns {Object} - 包含同名商品和价格历史数据的对象
 * @returns {Array} Object.products - 同名商品数组
 * @returns {Number} Object.minPrice - 最低价格
 * @returns {Number} Object.maxPrice - 最高价格
 */
function getPriceHistoryByName(productName) {
    try {
        if (!productName) {
            return { products: [], minPrice: 0, maxPrice: 0 };
        }

        // 获取所有产品
        const allProducts = productService.getAllProducts();

        // 过滤出同名商品
        let productsWithSameName = allProducts.filter(p => p.name === productName);

        if (!productsWithSameName.length) {
            return { products: [], minPrice: 0, maxPrice: 0 };
        }

        // 确保每个商品都有价格历史数组
        productsWithSameName = productsWithSameName.map(product => {
            if (!product.priceHistory || !Array.isArray(product.priceHistory)) {
                product.priceHistory = [];
            }
            return product;
        });

        // 计算价格范围
        const allPrices = productsWithSameName.map(p => Number(p.currentPrice || 0));
        const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
        const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

        return {
            products: productsWithSameName,
            minPrice,
            maxPrice
        };
    } catch (error) {
        console.error('获取同名商品价格历史失败:', error);
        return { products: [], minPrice: 0, maxPrice: 0 };
    }
}

/**
 * 删除价格历史记录
 * 
 * @param {String} productId - 商品ID
 * @param {String} historyId - 价格历史记录ID
 * @returns {Boolean} - 删除是否成功
 */
// 已移除deletePriceHistory方法，使用productService.deleteProduct(productId, historyId)代替

/**
 * 计算价格变化趋势
 * 
 * @param {String} productId - 商品ID
 * @returns {Object} - 价格趋势对象
 * @returns {Number} Object.change - 价格变化百分比
 * @returns {String} Object.trend - 趋势类型: 'up', 'down', 'stable'
 * @returns {Number} Object.oldest - 最早的价格
 * @returns {Number} Object.latest - 最新的价格
 */
function calculatePriceTrend(productId) {
    try {
        const history = getPriceHistory(productId);

        if (history.length < 2) {
            return { change: 0, trend: 'stable', oldest: null, latest: null };
        }

        // 获取最早和最新的价格记录
        const latest = history[0]; // 因为已经按日期降序排序
        const oldest = history[history.length - 1];

        // 如果货币不同，无法比较
        if (latest.currency.code !== oldest.currency.code) {
            return {
                change: 0,
                trend: 'stable',
                oldest: oldest.price,
                latest: latest.price,
                differentCurrency: true
            };
        }

        // 计算价格变化百分比
        const change = ((latest.price - oldest.price) / oldest.price) * 100;

        // 确定趋势
        let trend;
        if (change > 0) {
            trend = 'up';
        } else if (change < 0) {
            trend = 'down';
        } else {
            trend = 'stable';
        }

        return {
            change: change,
            trend: trend,
            oldest: oldest.price,
            latest: latest.price,
            oldestDate: oldest.date,
            latestDate: latest.date
        };
    } catch (error) {
        console.error('计算价格趋势失败:', error);
        return { change: 0, trend: 'stable', oldest: null, latest: null };
    }
}

/**
 * 准备趋势图数据点
 * 
 * @param {Array} filtered - 过滤后的价格历史记录
 * @param {String} highlightId - 要高亮的记录ID
 * @returns {Object} - 趋势图数据
 * @returns {Array} Object.chartPoints - 图表数据点
 * @returns {Object} Object.minItem - 价格最低的商品
 * @returns {Object} Object.mainItem - 主要展示的商品（高亮或最低价）
 */
function prepareTrendChartData(filtered, highlightId) {
    try {
        // 确保数据有效且不丢失商品信息
        const validProducts = filtered ? filtered.filter(item => {
            // 检查基本数据有效性
            const hasBasicProps = item && item.id;

            if (!hasBasicProps) {
                console.warn('发现完全无效商品数据:', item);
                return false;
            }

            // 记录价格和日期情况，但不过滤掉商品
            if (typeof item.currentPrice === 'undefined') {
                // 设置默认价格以免图表绘制失败
                item.currentPrice = 0;
            }

            if (!item.date) {
                // 设置默认日期以免图表绘制失败
                item.date = new Date().toISOString().split('T')[0];
            }

            return true; // 保留所有基本有效的商品
        }) : [];


        if (!validProducts.length) {
            return {
                chartPoints: [],
                minItem: null,
                mainItem: null
            };
        }

        // 计算价格范围，用于绘制趋势图
        let min = Math.min(...validProducts.map(h => Number(h.currentPrice)));
        let max = Math.max(...validProducts.map(h => Number(h.currentPrice)));
        let range = max - min || 1;

        // 找到价格最低的商品id
        let minItem = validProducts.find(item => Number(item.currentPrice) === min);
        let minId = minItem ? minItem.id : null;

        // 如果有高亮id，则主展示为该id对应商品，否则为最低价商品
        let mainItem = highlightId ? validProducts.find(item => item.id === highlightId) : minItem;

        // 准备趋势图数据点

        let chartPoints = validProducts.map((item, idx) => {
            // 保留原始的ID，不进行任何修改
            const itemId = item.id;

            return {
                ...item,
                id: itemId, // 保留原始ID
                x: 30 + ((validProducts.length - 1 - idx) * 240 / (validProducts.length - 1 || 1)), // 颠倒 x 轴顺序
                y: 120 - ((Number(item.currentPrice) - min) / range) * 80,
                isCurrent: item.id === (highlightId || minId),
                isMin: Number(item.currentPrice) === min,
                currencySymbol: item.currency ? item.currency.symbol : '¥', // 从 model 的 currency 读取符号
                swiping: false // 确保初始化 swiping 属性为 false
            };
        });

        return {
            chartPoints,
            minItem,
            mainItem
        };
    } catch (error) {
        console.error('准备趋势图数据失败:', error);
        return {
            chartPoints: [],
            minItem: null,
            mainItem: null
        };
    }
}

module.exports = {
    addPriceHistory,
    getPriceHistory,
    getPriceHistoryByName,
    calculatePriceTrend,
    prepareTrendChartData
};
