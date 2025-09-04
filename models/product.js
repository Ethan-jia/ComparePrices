// 商品数据结构定义
const { getDefaultCurrency } = require('../services/currencyService');

/**
 * 商品对象结构
 * @typedef {Object} Product
 * @property {string} id - 唯一ID
 * @property {string} name - 商品名
 * @property {string} date - 购买日期（yyyy-mm-dd）
 * @property {string} location - 购买地点
 * @property {number} originalPrice - 原价
 * @property {number} currentPrice - 现价
 * @property {Object} currency - 货币信息
 * @property {string} currency.label - 货币名称，如"人民币"
 * @property {string} currency.symbol - 货币符号，如"¥"
 * @property {string} currency.code - 货币代码，如"CNY"
 * @property {string} brand - 品牌
 * @property {string} note - 备注
 * @property {number} createTime - 创建时间戳
 * @property {number} updateTime - 更新时间戳
 */

const defaultProduct = {
    id: '',
    name: '',
    date: '',
    location: '',
    brand: '',
    originalPrice: 0,
    currentPrice: 0,
    currency: getDefaultCurrency(),
    note: '',
    createTime: 0,
    updateTime: 0
};

/**
 * 创建一个标准商品对象
 * @param {Partial<Product>} data
 * @returns {Product}
 */
function createProduct(data = {}) {
    // 自动丢弃多余字段（如历史category）
    const merged = Object.assign({}, defaultProduct, data);

    // 确保货币字段正确合并
    if (data.currency) {
        merged.currency = Object.assign({}, defaultProduct.currency, data.currency);
    }

    delete merged.category;
    return merged;
}

module.exports = {
    defaultProduct,
    createProduct
};
