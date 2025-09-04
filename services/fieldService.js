// fieldService.js
// 通用历史字段去重获取服务

function getAllFieldValues(field) {
    try {
        const products = wx.getStorageSync('products') || [];
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

module.exports = {
    getAllFieldValues,
    getAllProductNames,
    getAllLocations,
    getAllBrands
};
