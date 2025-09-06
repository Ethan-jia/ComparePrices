/**
 * 商品数据服务
 * 
 * 负责商品的增删查改和本地存储，集中处理所有商品数据相关操作
 * 遵循统一的错误处理和数据一致性保证
 * 
 * 功能：
 * 1. 商品        const product = products.find(p => p.id === id);
        return product || null;
    } catch (e) {
        // 按ID获取商品失败
        return null;操作
 * 2. 商品搜索和过滤
 * 3. 商品排序
 * 4. 数据验证和错误处理
 */

const { createProduct } = require('../models/product');

// 存储键常量
const STORAGE_KEY = 'products';

/**
 * 获取所有商品
 * @returns {Array} 商品列表
 */
function getAllProducts() {
    try {
        const products = wx.getStorageSync(STORAGE_KEY) || [];

        if (products && products.length > 0) {
            const productWithHistory = products.filter(p => p.priceHistory && p.priceHistory.length > 0);
        }

        return products;
    } catch (e) {
        console.error('getAllProducts - 获取商品数据失败:', e);
        return [];
    }
}

/**
 * 保存所有商品
 * @param {Array} products - 商品列表
 * @returns {boolean} 是否保存成功
 */
function saveAllProducts(products) {
    try {

        if (products && products.length > 0) {
            const productWithHistory = products.filter(p => p.priceHistory && p.priceHistory.length > 0);
        }
        wx.setStorageSync(STORAGE_KEY, products);
        return true;
    } catch (e) {
        console.error('saveAllProducts - 保存失败:', e);
        return false;
    }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 添加商品
 * @param {Object} productData - 商品数据
 * @returns {Object} 创建的商品对象
 */
function addProduct(productData) {
    try {
        const products = getAllProducts();

        // 创建新商品对象
        const product = createProduct({
            id: generateId(),
            ...productData,
            createTime: Date.now(),
            updateTime: Date.now()
        });

        // 添加到列表
        products.push(product);

        // 保存
        saveAllProducts(products);
        return product;
    } catch (e) {
        // 添加商品失败
        throw e;
    }
}

/**
 * 按ID获取商品
 * @param {string} id 商品ID
 * @returns {Object|null} 商品对象或null
 */
function getProductById(id) {
    try {
        const products = getAllProducts();
        return products.find(p => p.id === id) || null;
    } catch (e) {
        console.error('按ID获取商品失败:', e);
        return null;
    }
}

/**
 * 更新商品
 * @param {string} id - 商品ID
 * @param {Object} updateData - 更新数据
 * @returns {Object|null} 更新后的商品对象或null
 */
function updateProduct(id, updateData) {
    try {
        const products = getAllProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            // 未找到要更新的商品
            return null;
        }

        // 创建更新后的商品对象
        const updatedProduct = createProduct({
            ...products[index],
            ...updateData,
            updateTime: Date.now()
        });

        // 替换原对象
        products[index] = updatedProduct;

        // 保存
        saveAllProducts(products);
        return updatedProduct;
    } catch (e) {
        // 更新商品失败
        return null;
    }
}

/**
 * 删除商品
 * @param {string} id - 商品ID
 * @returns {boolean} 是否删除成功
 */
function deleteProduct(id) {
    try {
        const products = getAllProducts();

        // 查找要删除的商品索引
        const productIndex = products.findIndex(p => String(p.id) === String(id));

        if (productIndex === -1) {
            return false;
        }

        // 获取要删除的商品信息（用于日志）
        const productToDelete = products[productIndex];

        // 从数组中移除该商品
        products.splice(productIndex, 1);

        // 保存更新后的商品列表
        saveAllProducts(products);
        return true;
    } catch (e) {
        console.error('service.deleteProduct - 删除失败:', e);
        return false;
    }
}
/**
 * 添加商品价格历史
 * @param {string} productId 商品ID
 * @param {Object} priceData 价格数据 {price, date, location, currency, note}
 * @returns {Object|null} 创建的价格历史记录或null
 */
function addPriceHistory(productId, priceData) {
    try {
        const products = getAllProducts();
        const index = products.findIndex(p => p.id === productId);

        if (index === -1) {
            // 未找到商品
            return null;
        }

        const product = products[index];
        if (!product.priceHistory) {
            product.priceHistory = [];
        }

        // 添加价格历史记录
        const historyEntry = {
            id: generateId(),
            price: priceData.price,
            date: priceData.date || new Date().toISOString().split('T')[0],
            location: priceData.location || product.location,
            currency: priceData.currency || product.currency,
            note: priceData.note || ''
        };

        product.priceHistory.push(historyEntry);
        product.updateTime = Date.now();

        products[index] = product;
        saveAllProducts(products);

        return historyEntry;
    } catch (e) {
        // 添加价格历史失败
        return null;
    }
}

/**
 * 删除价格历史记录
 * @param {string} productId - 商品ID
 * @param {string} historyId - 价格历史记录ID
 * @returns {boolean} 是否删除成功
 */
// 已移除deletePriceHistory函数，功能已合并到deleteProduct函数中

/**
 * 搜索商品
 * @param {string} keyword - 搜索关键词
 * @param {Object} filters - 过滤条件
 * @returns {Array} 匹配的商品列表
 */
function searchProducts(keyword, filters = {}) {
    try {
        let products = getAllProducts();

        // 关键词搜索
        if (keyword) {
            const lowercaseKeyword = keyword.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(lowercaseKeyword) ||
                p.brand.toLowerCase().includes(lowercaseKeyword) ||
                p.location.toLowerCase().includes(lowercaseKeyword) ||
                (p.note && p.note.toLowerCase().includes(lowercaseKeyword))
            );
        }

        // 应用过滤条件
        if (filters.minPrice) {
            products = products.filter(p => p.currentPrice >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            products = products.filter(p => p.currentPrice <= parseFloat(filters.maxPrice));
        }

        if (filters.location) {
            products = products.filter(p => p.location === filters.location);
        }

        if (filters.brand) {
            products = products.filter(p => p.brand === filters.brand);
        }

        return products;
    } catch (e) {
        // 搜索商品失败
        return [];
    }
}

/**
 * 排序商品列表
 * @param {Array} products - 商品列表
 * @param {string} sortBy - 排序字段 (name, price, date, brand, location)
 * @param {boolean} ascending - 是否升序
 * @returns {Array} 排序后的商品列表
 */
function sortProducts(products, sortBy = 'date', ascending = false) {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    const sortedProducts = [...products];

    switch (sortBy) {
        case 'name':
            sortedProducts.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return ascending
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            });
            break;

        case 'price':
            sortedProducts.sort((a, b) => {
                // 注意：这里没有处理不同货币的转换
                const priceA = parseFloat(a.currentPrice) || 0;
                const priceB = parseFloat(b.currentPrice) || 0;
                return ascending
                    ? priceA - priceB
                    : priceB - priceA;
            });
            break;

        case 'date':
            sortedProducts.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return ascending
                    ? dateA - dateB
                    : dateB - dateA;
            });
            break;

        case 'brand':
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || '').toLowerCase();
                const brandB = (b.brand || '').toLowerCase();
                return ascending
                    ? brandA.localeCompare(brandB)
                    : brandB.localeCompare(brandA);
            });
            break;

        case 'location':
            sortedProducts.sort((a, b) => {
                const locationA = (a.location || '').toLowerCase();
                const locationB = (b.location || '').toLowerCase();
                return ascending
                    ? locationA.localeCompare(locationB)
                    : locationB.localeCompare(locationA);
            });
            break;

        default:
            // 默认按更新时间排序
            sortedProducts.sort((a, b) => {
                return ascending
                    ? a.updateTime - b.updateTime
                    : b.updateTime - a.updateTime;
            });
    }

    return sortedProducts;
}

/**
 * 验证商品数据
 * @param {Object} productData - 商品数据
 * @returns {Object} 验证结果，{valid: boolean, errors: string[]}
 */
function validateProduct(productData) {
    const errors = [];

    // 检查必填字段
    if (!productData.name || !productData.name.trim()) {
        errors.push('商品名称不能为空');
    }

    if (!productData.date) {
        errors.push('购买日期不能为空');
    }

    if (!productData.location || !productData.location.trim()) {
        errors.push('购买地点不能为空');
    }

    if (productData.currentPrice === undefined || productData.currentPrice === null || isNaN(productData.currentPrice)) {
        errors.push('现价不能为空且必须是有效数字');
    } else if (parseFloat(productData.currentPrice) <= 0) {
        errors.push('现价必须大于0');
    }

    // 检查可选字段格式
    if (productData.originalPrice !== undefined && productData.originalPrice !== null && productData.originalPrice !== '') {
        if (isNaN(productData.originalPrice) || parseFloat(productData.originalPrice) <= 0) {
            errors.push('原价必须是有效数字且大于0');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    addPriceHistory,
    searchProducts,
    sortProducts,
    validateProduct,
    saveAllProducts
};
