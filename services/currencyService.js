/**
 * 货币服务模块
 * 集中管理所有货币相关的功能和数据
 */

/**
 * 支持的货币列表
 */
const CURRENCIES = [
    { label: '人民币', symbol: '¥', code: 'CNY' },
    { label: '林吉特', symbol: 'RM', code: 'MYR' },
    { label: '美元', symbol: '$', code: 'USD' },
    { label: '欧元', symbol: '€', code: 'EUR' },
    { label: '英镑', symbol: '£', code: 'GBP' },
];

/**
 * 保存用户首选货币到本地存储
 * @param {string} code 货币代码
 */
function savePreferredCurrency(code) {
    try {
        wx.setStorageSync('preferred_currency', code);
    } catch (e) {
        // 保存首选货币失败
    }
}

/**
 * 获取用户首选货币代码
 * @returns {string|null} 货币代码，如果未设置则返回null
 */
function getPreferredCurrencyCode() {
    try {
        return wx.getStorageSync('preferred_currency') || null;
    } catch (e) {
        // 获取首选货币失败
        return null;
    }
}

/**
 * 获取默认货币
 * @returns {Object} 默认货币对象（优先返回用户首选货币，否则返回人民币）
 */
function getDefaultCurrency() {
    const preferredCode = getPreferredCurrencyCode();
    if (preferredCode) {
        const currency = getCurrencyByCode(preferredCode);
        if (currency) return currency;
    }
    return CURRENCIES[0]; // 返回人民币作为兜底默认值
}

/**
 * 获取所有支持的货币列表
 * @returns {Array} 货币列表
 */
function getAllCurrencies() {
    return CURRENCIES;
}

/**
 * 根据货币代码查找货币对象
 * @param {string} code 货币代码，如 'CNY', 'USD' 等
 * @returns {Object|null} 找到的货币对象，如果未找到则返回 null
 */
function getCurrencyByCode(code) {
    return CURRENCIES.find(c => c.code === code) || null;
}

/**
 * 根据索引获取货币对象
 * @param {number} index 货币在列表中的索引
 * @returns {Object} 货币对象，如果索引无效则返回默认货币
 */
function getCurrencyByIndex(index) {
    if (index >= 0 && index < CURRENCIES.length) {
        return CURRENCIES[index];
    }
    return getDefaultCurrency();
}

/**
 * 查找货币在列表中的索引
 * @param {Object|string} currency 货币对象或货币代码
 * @returns {number} 索引，如果未找到则返回 0（默认货币索引）
 */
function findCurrencyIndex(currency) {
    if (!currency) return 0;

    const code = typeof currency === 'string' ? currency : currency.code;
    const index = CURRENCIES.findIndex(c => c.code === code);
    return index >= 0 ? index : 0;
}

/**
 * 格式化显示金额
 * @param {number} amount 金额
 * @param {Object} currency 货币对象
 * @returns {string} 格式化后的金额字符串，包含货币符号
 */
function formatAmount(amount, currency = getDefaultCurrency()) {
    if (amount === null || amount === undefined) return '';
    return `${currency.symbol}${amount}`;
}

/**
 * 获取用户首选货币的索引
 * @returns {number} 首选货币在CURRENCIES中的索引，如果未设置则返回0（人民币）
 */
function getPreferredCurrencyIndex() {
    const preferredCode = getPreferredCurrencyCode();
    return findCurrencyIndex(preferredCode);
}

module.exports = {
    CURRENCIES,
    getDefaultCurrency,
    getAllCurrencies,
    getCurrencyByCode,
    getCurrencyByIndex,
    findCurrencyIndex,
    formatAmount,
    savePreferredCurrency,
    getPreferredCurrencyCode,
    getPreferredCurrencyIndex
};
