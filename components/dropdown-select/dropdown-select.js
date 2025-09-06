// components/dropdown-select/dropdown-select.js
/**
 * 通用下拉选择器组件
 * 
 * 功能:
 * 1. 支持输入筛选和自动完成
 * 2. 支持点击选择
 * 3. 处理输入框失焦和点击外部区域自动关闭下拉框
 * 4. 支持自定义样式
 */
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 输入框的值
        value: {
            type: String,
            value: ''
        },
        // 输入框占位符
        placeholder: {
            type: String,
            value: '请选择'
        },
        // 候选项列表
        options: {
            type: Array,
            value: []
        },
        // 是否显示下拉列表
        showDropdown: {
            type: Boolean,
            value: false
        },
        // 高亮显示的选项索引
        highlightIndex: {
            type: Number,
            value: -1
        },
        // 自定义样式类
        customClass: {
            type: String,
            value: ''
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
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 筛选后的选项列表
        filteredOptions: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 输入事件处理函数
         * @param {Object} e - 事件对象
         */
        onInput(e) {
            const value = e.detail.value;
            const filteredOptions = this._filterOptions(value);

            this.setData({
                filteredOptions: filteredOptions
            });

            // 触发输入事件
            this.triggerEvent('input', { value: value });
        },

        /**
         * 聚焦事件处理函数
         */
        onFocus() {
            const filteredOptions = this._filterOptions(this.properties.value);

            this.setData({
                filteredOptions: filteredOptions,
                showDropdown: filteredOptions.length > 0
            });

            // 触发聚焦事件
            this.triggerEvent('focus');
        },

        /**
         * 失焦事件处理函数
         */
        onBlur() {
            // 延迟关闭下拉框，确保能先处理点击选项
            setTimeout(() => {
                this.setData({
                    showDropdown: false
                });

                // 触发失焦事件
                this.triggerEvent('blur');
            }, 200);
        },

        /**
         * 选择选项
         * @param {Object} e - 事件对象
         */
        onSelectOption(e) {
            const option = e.currentTarget.dataset.option;

            this.setData({
                showDropdown: false
            });

            // 触发选择事件
            this.triggerEvent('select', { value: option });
        },

        /**
         * 筛选选项
         * @param {String} input - 输入值
         * @return {Array} 筛选后的选项列表
         */
        _filterOptions(input) {
            if (!input) return this.properties.options;

            const inputLower = input.toLowerCase();
            return this.properties.options.filter(option =>
                option.toLowerCase().indexOf(inputLower) !== -1
            );
        },

        /**
         * 阻止冒泡，避免点击下拉框时触发外层的点击事件
         */
        noop() { }
    },

    /**
     * 监听器
     */
    observers: {
        'options': function (options) {
            // 当options改变时更新筛选列表
            const filteredOptions = this._filterOptions(this.properties.value);
            this.setData({
                filteredOptions: filteredOptions
            });
        }
    }
})
