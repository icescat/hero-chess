# 勇者棋 Wiki

游戏资料百科全书，包含所有道具、装备、技能、事件等详细信息。

## 📖 功能特性

### 数据查询
- **遗物** - 18种永久提升能力的珍贵道具
- **Buff效果** - 25+种状态效果（增益/减益/道具）
- **装备系统** - 武器、护甲及强化系统
- **锻造材料** - 普通和稀有材料
- **天赋系统** - 21种天赋技能树
- **随从系统** - 6种职业随从及技能
- **坐骑系统** - 各种坐骑及特殊能力
- **格子事件** - 38个格子的详细说明
- **游戏机制** - 核心系统详解
- **攻略技巧** - 进阶指南

### 交互功能
- 🔍 **搜索功能** - 快速查找任何内容
- 🏷️ **分类筛选** - 按类型筛选数据
- 📱 **响应式设计** - 支持PC和移动端
- 🎨 **现代化UI** - 美观的暗色主题

## 🚀 使用方法

### 本地运行

1. 直接打开 `index.html`（需要浏览器支持ES6）
2. 或使用本地服务器：
   ```bash
   # 使用Python
   python -m http.server 8000
   # 然后访问 http://localhost:8000
   
   # 使用Node.js
   npx http-server
   ```

### 在线部署

可以将整个 `rollhero` 文件夹部署到：
- GitHub Pages
- Netlify
- Vercel
- 任何静态网站托管服务

## 📁 文件结构

```
rollhero/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式表
├── js/
│   ├── data-loader.js  # 数据加载器
│   └── wiki.js         # 核心脚本
└── README.md           # 说明文档
```

## 🔗 数据来源

Wiki数据直接从游戏的JSON数据文件加载：
- `../src/assets/data/relics.json` - 遗物数据
- `../src/assets/data/buffs.json` - Buff数据
- `../src/assets/data/equips.json` - 装备数据
- `../src/assets/data/materials.json` - 材料数据
- `../src/assets/data/followers.json` - 随从数据
- `../src/assets/data/mounts.json` - 坐骑数据

## 🎨 技术栈

- **HTML5** - 语义化标签
- **CSS3** - Flexbox/Grid布局、渐变、动画
- **JavaScript ES6+** - 原生JS，无依赖框架
- **响应式设计** - 支持各种屏幕尺寸

## 📝 版本历史

### V1.0.5 (2025-11-27)
- ✅ 初始版本发布
- ✅ 完整的数据展示系统
- ✅ 搜索和筛选功能
- ✅ 响应式设计
- ✅ 暗色主题UI

### 计划功能
- [ ] 高级搜索（多条件）
- [ ] 数据对比功能
- [ ] 用户笔记系统
- [ ] 数据导出功能
- [ ] 多语言支持

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

与主游戏项目相同

