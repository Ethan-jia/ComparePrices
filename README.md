<div align="center">
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

- 商品录入、编辑、删除 / Add, edit, delete products
- 商品详情与历史价格趋势折线图 / Product detail & price trend chart
- 价格搜索与筛选 / Search & filter by product name
- 数据统计（商品总数、消费总额、平均价格、分类统计、月度统计等）/ Data statistics (total products, total spent, average price, category/monthly stats)
- 最近添加商品快捷入口 / Quick access to recently added products
- 本地存储，无需后台 / Local storage only, no backend required



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
