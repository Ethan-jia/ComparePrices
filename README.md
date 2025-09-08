<div align="## 项目简介 | Project Overview

"多比比"是一款专注于价格比较的微信小程序，帮助用户追踪和对比日常商品价格。通过记录商品在不同店铺、不同时间的价格，用户可以直观地看到价格趋势，做出更明智的购买决策。支持多维度筛选、价格趋势图表、数据统计分析等功能，是您省钱购物的得力助手。所有数据完全保存在本地，无需注册和登录，充分保障用户隐私安全。

DUOBIBI is a WeChat Mini Program focusing on price comparison. By tracking product prices across different stores and times, users can visualize price trends and make smarter purchasing decisions. With multi-dimensional filtering, price trend charts, and statistical analysis, it's your trusted shopping assistant. All data is stored locally, with no registration required, ensuring complete privacy protection.r">
	<img src="./小程序二维码.jpg" alt="ComparePrices小程序二维码" width="180" />
	<br />
	<b>扫码体验 多比比 小程序</b>
</div>

# 多比比 小程序

# DUOBIBI Mini Program



## 项目简介 | Project Overview

“多比比” 是一个本地运行的微信小程序，帮助用户记录和对比日常商品价格，支持商品添加、编辑、删除、历史价格趋势、数据统计等功能。所有数据均保存在本地，无需注册和登录，隐私安全。

ComparePrices is a WeChat Mini Program for recording and comparing daily product prices. All data is stored locally, no registration or login required, privacy-friendly.



## 主要功能 | Main Features

- **商品管理**：快速录入、编辑和删除商品，支持品牌、店铺等多个属性 / Product management with support for brands, stores and more
- **价格历史记录**：记录同一商品在不同时间、不同地点的价格，通过滑动可方便地管理每条记录 / Price history records with swipe-to-manage functionality
- **价格趋势分析**：自动生成历史价格趋势折线图，直观呈现价格变化 / Price trend chart for visualizing price changes over time
- **多维度筛选**：按名称搜索，按品牌、店铺筛选，智能处理无数据场景 / Smart filtering by name, brand, store with empty-state handling
- **数据统计**：提供商品总数、消费总额、平均价格、分类统计、月度统计等多维度分析 / Comprehensive statistics (total products, spending, average prices, etc.)
- **货币支持**：支持多种货币，方便记录国内外商品价格 / Multi-currency support for recording prices worldwide
- **本地存储**：所有数据保存在本地，无需注册和登录，保护用户隐私 / Local storage only, no registration required, privacy-friendly



## 目录结构 | Directory Structure

```
images/           # 图片资源 / Image assets
pages/            # 小程序页面 / Mini program pages
	add/            # 添加商品 / Add product
	edit/           # 编辑商品 / Edit product
	detail/         # 商品详情 / Product detail
	index/          # 首页（商品列表）/ Home (product list)
	statistics/     # 数据统计 / Data statistics
components/       # 公共组件（如自定义导航栏）/ Common components (e.g. navigation bar)
utils/            # 工具函数 / Utility functions
app.js/json/wxss  # 全局配置 / Global config
```



## 快速开始 | Quick Start

1. 使用微信开发者工具导入本项目目录。
2. 直接预览、调试和发布，无需任何后端配置。

1. Import this project into WeChat DevTools.
2. Preview, debug, and publish directly. No backend needed.



## 注意事项 | Notes

- 首次进入不会有任何测试数据，所有数据均为本地自建。
- No test data on first launch, all data is user-created and stored locally.



## 更新日志 | Changelog

### 版本 1.0.4 | Version 1.0.4

- **筛选优化**：修复了店铺筛选在纯英文情况下的问题，确保筛选功能更加可靠。
- **筛选位置调整**：将筛选功能移动到底部，提升用户体验。
- **详情页功能增强**：在商品详情页新增了“添加”按钮，方便用户快速跳转到添加页面。

### 版本 1.0.3 | Version 1.0.3

- **优化的筛选体验**：改进了品牌和店铺筛选功能，当无数据时自动隐藏相应筛选选项。
- **更稳健的删除功能**：修复了价格历史记录的删除功能，现在可以正确删除滑动选中的记录。
- **更好的错误处理**：增强了应用的稳定性，添加更多用户友好的错误提示。
- **代码优化**：重构了部分核心功能，提高了应用性能和响应速度。

### 版本 1.0.2 | Version 1.0.2

- **特价价格颜色更改**：特价价格使用更明显的颜色，便于用户快速识别。
- **条目折叠**：实现了条目折叠功能，点击后才显示详情。
- **历史记录功能**：在添加和编辑页面中，为商品名称和购买地点增加了历史记录建议。
- **货币选择**：支持用户选择不同的货币。
- **品牌字段**：新增了品牌字段。
- **筛选功能**：支持按品牌和店铺进行筛选。

---

**比价助手** - 让购物更明智，让价格更透明 🛒✨

**Price comparison assistant** - Make shopping smarter and prices more transparent🛒✨
