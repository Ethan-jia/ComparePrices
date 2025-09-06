// fieldService.js
// 通用历史字段去重获取服务

// 引入在声明前，移到顶部
const productService = require('./productService');

function getAllFieldValues(field) {
    try {
        const products = productService.getAllProducts();
        return Array.from(new Set(products.map(p => p[field]).filter(Boolean)));
    } catch (e) {
        return [];
    }
}

function getAllProductNames() {
    return getAllFieldValues('name');
}
function getAllLocations() {
    return getAllFieldValues('location');
}
function getAllBrands() {
    return getAllFieldValues('brand');
}

function getRecordCountByProductName(productName) {
    try {
        const products = productService.getAllProducts();
        const filteredProducts = products.filter(product => product.name === productName);
        return filteredProducts.length;
    } catch (e) {
        // 获取记录数失败
        return 0;
    }
}

module.exports = {
    getAllFieldValues,
    getAllProductNames,
    getAllLocations,
    getAllBrands,
    getRecordCountByProductName
};
