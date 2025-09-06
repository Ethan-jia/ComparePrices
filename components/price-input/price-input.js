// components/price-input/price-input.js
/**
 * 价格输入组件
 * 
 * 功能:
 * 1. 显示货币符号
 * 2. 数字格式验证
 * 3. 支持必填校验
 */
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 价格值
        value: {
            type: String,
            value: ''
        },
        // 货币符号
        currencySymbol: {
            type: String,
            value: '¥'
        },
        // 输入框占位符
        placeholder: {
            type: String,
            value: '请输入价格'
        },
        // 是否必填
        required: {
            type: Boolean,
            value: false
        },
        // 标签文字
        label: {
            type: String,
            value: ''
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 符号宽度适配
        symbolWidth: 28
    },

    /**
     * 组件的生命周期
     */
    lifetimes: {
        attached() {
            // 根据货币符号的长度动态调整宽度
            const symbolWidth = Math.max(this.properties.currencySymbol.length * 16, 36);
            this.setData({
                symbolWidth: symbolWidth
            });
        }
    },

    /**
     * 监听器
     */
    observers: {
        'currencySymbol': function (symbol) {
            // 根据货币符号的长度动态调整宽度
            const symbolWidth = Math.max(symbol.length * 16, 28);
            this.setData({
                symbolWidth: symbolWidth
            });
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 输入事件处理函数
         */
        onInput(e) {
            const value = e.detail.value;

            // 校验是否为有效的价格格式
            if (value && !/^[0-9]+(\.[0-9]{0,2})?$/.test(value) && value !== '.') {
                return this.properties.value;
            }

            this.triggerEvent('input', { value });
        },

        /**
         * 失焦事件处理函数
         */
        onBlur(e) {
            const value = e.detail.value;

            // 格式化价格，确保小数点后最多两位
            let formattedValue = value;
            if (value && value !== '.') {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = num.toFixed(2).replace(/\.00$|0$/g, '');
                }
            }

            this.triggerEvent('blur', { value: formattedValue });
        },

        /**
         * 聚焦事件处理函数
         */
        onFocus(e) {
            this.triggerEvent('focus');
        }
    }
})
