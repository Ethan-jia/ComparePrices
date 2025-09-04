// 商品数据服务：负责商品的增删查改和本地存储


const { createProduct } = require('../models/product');
const STORAGE_KEY = 'products';

/** 获取所有商品 */
function getAllProducts() {
    try {
        return wx.getStorageSync(STORAGE_KEY) || [];
    } catch (e) {
        return [];
    }
}

/** 保存所有商品 */
function saveAllProducts(products) {
    wx.setStorageSync(STORAGE_KEY, products);
}

/** 新增商品 */
function addProduct(product) {
    const products = getAllProducts();
    // 保证结构标准化
    products.push(createProduct(product));
    saveAllProducts(products);
}

/** 删除指定商品（按id） */
function deleteProductById(id) {
    let products = getAllProducts();
    products = products.filter(p => p.id !== id);
    saveAllProducts(products);
}

/** 删除指定商品名下所有商品 */
function deleteProductsByName(name) {
    let products = getAllProducts();
    products = products.filter(p => p.name !== name);
    saveAllProducts(products);
}

/** 更新商品（按id） */
function updateProductById(id, newData) {
    let products = getAllProducts();
    products = products.map(p => p.id === id ? createProduct({ ...p, ...newData }) : p);
    saveAllProducts(products);
}

module.exports = {
    getAllProducts,
    saveAllProducts,
    addProduct,
    deleteProductById,
    deleteProductsByName,
    updateProductById
};
