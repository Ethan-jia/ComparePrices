// utils/autoComplete.js
// 通用自动补全/下拉筛选工具
// 支持大小写不敏感、去除空格、去重，预留拼音首字母匹配扩展点
function normalize(str) {
    return (str || '').toString().trim().toLowerCase();
}

function unique(arr) {
    return Array.from(new Set(arr));
}

// 预留拼音首字母匹配（如需可扩展）
// function matchPinyin(input, item) {
//     // 可引入第三方库如 tiny-pinyin 实现
//     return false;
// }

module.exports = {
    filterList(input, list) {
        if (!input) return unique(list);
        const normInput = normalize(input);
        return unique(list.filter(item => {
            const normItem = normalize(item);
            // 基础：包含关系
            if (normItem.indexOf(normInput) !== -1) return true;
            // 预留拼音首字母匹配
            // if (matchPinyin(normInput, normItem)) return true;
            return false;
        }));
    },
    shouldShowDropdown(input, filtered) {
        return !!(filtered.length && normalize(input));
    }
};
