# 勇者棋 (Hero Chess) - Flash to HTML5 移植项目

**项目状态**：✅ V1.0.4 正式版（2025-11-26）  
**完成度**：100%（核心游戏）  
**开发模式**：自由扩展阶段

---

## 🎮 项目简介

将原Flash版本的"勇者棋"游戏完整移植到HTML5平台的项目。这是一款类似大富翁的棋盘策略RPG游戏，包含丰富的系统和内容。

**技术栈**：CreateJS (HTML5) + JavaScript (ES6+)  
**原始版本**：Flash (ActionScript 3.0)  
**目标平台**：PC端浏览器（Microsoft Edge）  
**分辨率**：640×480（固定）

---

## ✨ 当前版本：V1.0.4

### 🎉 完成内容（100%）

**核心系统**（9大系统）：
- ✅ 角色属性系统（90级成长）
- ✅ 战斗系统（回合制）
- ✅ 装备系统（16武器+16护甲，5品质，+0~+9强化）
- ✅ Buff系统（24种Buff）
- ✅ 遗物系统（18种遗物）
- ✅ 天赋系统（21种天赋）
- ✅ 任务系统（7种任务类型）
- ✅ 随从系统（5种职业，5个等级）
- ✅ 坐骑系统（8种坐骑，6级马车）
- ✅ 婚姻系统（6种妻子）

**格子事件**（38种格子类型，100%）：
- 城镇、村庄、地牢、竞技场、营地、马厩、公会
- 温泉、神社、墓地、沙滩、码头、房屋
- 森林、草原、雪地、沙漠、沼泽、熔岩等

**高级功能**：
- ✅ 自动游戏AI系统
- ✅ 存档系统（4槽位）
- ✅ 结局系统（10种结局）
- ✅ 建设系统（码头5阶段+房屋6阶段）
- ✅ 昼夜系统
- ✅ 竞技场排名赛（F-SSS九级）
- ✅ 数据库分离（JSON）

### 📊 技术特点

1. **数据驱动架构**
   - 6个JSON数据文件（buffs, relics, equips, materials, mounts, followers）
   - 代码与数据分离，便于调整和扩展

2. **现代化代码**
   - ES6+语法
   - Map/Set数据结构
   - 模块化设计
   - 详细中文注释

3. **开发工具**
   - GM调试面板（按~键打开）
   - 完整游戏Wiki百科

---

## 🚀 快速开始

### 运行游戏

```bash
# 方法1：使用Live Server插件（推荐）
# 在VS Code中右键 src/index.html > Open with Live Server

# 方法2：使用Python HTTP服务器
cd src
python -m http.server 8000
# 访问 http://localhost:8000
```

### 快捷键

- **P键**：开启/关闭自动游戏
- **~键**：打开GM调试面板
- **F12**：浏览器开发者工具

---

## 📁 项目结构

```
勇者棋/
├── src/                          # HTML5游戏源码
│   ├── index.html               # 游戏入口
│   ├── js/
│   │   ├── Main.js              # 主入口
│   │   ├── AssetManifest.js     # 资源清单
│   │   ├── core/                # 核心类（DataManager, GameConstants等）
│   │   ├── model/               # 游戏逻辑层（30+个类）
│   │   │   ├── chess-mixins/   # Chess类的Mixin（12个）
│   │   │   ├── Game.js
│   │   │   ├── Chess.js
│   │   │   ├── ChessProperty.js # 核心属性类（V1.0.4重写）
│   │   │   ├── BattleManager.js
│   │   │   └── ...
│   │   ├── ui/                  # UI层（9个面板）
│   │   └── utils/               # 工具类（Logger, RandomUtils等）
│   ├── assets/
│   │   ├── images/              # 格子图片（74张）
│   │   ├── sprites/             # 精灵动画
│   │   ├── fonts/               # 字体文件
│   │   └── data/                # 游戏数据（6个JSON文件）
│   └── css/
│       └── main.css
│
├── SWF/                         # 原Flash游戏资源（参考用）
│   └── scripts/                 # ActionScript源码（105个文件）
│
├── rollhero/                    # 游戏Wiki百科
│   ├── index.html               # Wiki主页
│   └── data/                    # Wiki数据（自动生成）
│
├── docs/                        # 开发文档（已精简）
│   ├── DEVELOPMENT-HISTORY.md   # 开发历史汇总
│   ├── V1.0-RELEASE.md          # V1.0正式版说明
│   ├── V1.0.4-COMPLETE.md       # V1.0.4完成报告
│   ├── progress-summary.md      # 项目进度概览
│   ├── auto-game-system.md      # 自动游戏系统文档
│   ├── data-separation-complete.md  # 数据分离完成报告
│   ├── known-issues.md          # 已知问题
│   ├── test-checklist.md        # 测试清单
│   └── quickstart.md            # 快速开始指南
│
├── README.md                    # 本文件
├── .cursorrules                 # AI开发规则
└── CHANGELOG.md                 # 版本变更日志
```

---

## 🎯 开发规则变更（V1.0之后）

**重要**：V1.0.4之后，开发规则已从"严格1:1复刻"转变为"自由扩展"模式。

### V1.0之前（已废止）
- ❌ 必须严格1:1复刻原版
- ❌ 禁止添加/修改/简化任何功能
- ❌ 必须查看AS3代码验证一致性

### V1.0之后（当前有效）✅
- ✅ **可以添加新功能**：新天赋、新遗物、新事件、新系统
- ✅ **可以优化体验**：改进UI、增强动画、优化性能
- ✅ **可以调整平衡**：修改数值、改变机制、平衡难度
- ✅ **可以创新设计**：不受原版限制，根据需求自由设计

**例外情况**：除非明确要求"按原版AS3实现某功能"，才需要参考原AS3代码。

---

## 📚 核心系统说明

### 1. 游戏循环
- 投骰子 → 移动 → 触发格子事件 → 结束回合
- 每圈12个格子，走完一圈切换昼夜
- 自动保存系统

### 2. 角色成长
- 等级1-90级，经验累积升级
- 生命、攻击、防御三维属性
- 21种天赋可学习，影响战斗和事件

### 3. 战斗系统
- 回合制战斗，考虑攻防、暴击、闪避
- 随从技能、坐骑加成、Buff效果
- 敌人类型：普通、精英、Boss、传奇、珍兽

### 4. 装备系统
- 武器+护甲双槽位
- 5种品质（普通/良好/精良/史诗/传说）
- 强化+0到+9，成功率递减
- 材料锻造升级

### 5. 自动游戏AI
- 按P键开启/关闭
- 智能选择格子、处理事件
- 战斗、购买、升级全自动

---

## 🛠️ 技术细节

### Flash AS3 到 JavaScript 映射

| Flash AS3 | CreateJS | 说明 |
|-----------|----------|------|
| `Sprite` | `Container` | 容器类 |
| `MovieClip` | `MovieClip` | 影片剪辑 |
| `TextField` | `Text` | 文本显示 |
| `SharedObject` | `localStorage` | 本地存储 |
| `addEventListener` | `on` / `addEventListener` | 事件监听 |
| `Ticker` | `Ticker` | 帧循环 |

### 开发环境要求
- **浏览器**：Microsoft Edge（最新版）
- **代码编辑器**：VS Code / Cursor
- **本地服务器**：Live Server插件或Python http.server

---

## 📖 文档索引

**核心文档**（已精简到9个）：
- [开发历史](docs/DEVELOPMENT-HISTORY.md) - 完整开发过程记录
- [V1.0发布说明](docs/V1.0-RELEASE.md) - V1.0正式版详情
- [V1.0.4完成报告](docs/V1.0.4-COMPLETE.md) - 当前版本状态
- [进度概览](docs/progress-summary.md) - 项目进度总结
- [自动游戏系统](docs/auto-game-system.md) - AI系统文档
- [数据分离报告](docs/data-separation-complete.md) - 数据架构说明
- [已知问题](docs/known-issues.md) - 已知Bug列表
- [测试清单](docs/test-checklist.md) - 测试指南
- [快速开始](docs/quickstart.md) - 新手入门

**Wiki百科**：
- [游戏Wiki](rollhero/index.html) - 完整游戏数据百科

---

## 🔧 V1.0.4 技术亮点

### 代码优化
- `ChessProperty.js`使用Map/Set重写，性能O(n)→O(1)
- `RandomUtils`统一随机数生成
- `GameConstants`魔数常量化
- `Logger`日志分级管理

### 数据分离
- 6个JSON数据文件，600+行代码数据化
- 数据与逻辑分离，便于修改和扩展
- 支持Wiki自动生成

### Bug修复
- V1.0.4共修复9个重写相关Bug
- 5轮迭代修复，确保稳定性

---

## 🚧 已知限制

1. **音频系统**：暂未实现BGM和音效（V1.1+计划）
2. **移动端**：仅支持PC端，未适配触摸（V1.1+计划）
3. **分辨率**：固定640×480，不支持响应式（V2.0+计划）

---

## 📈 版本历史

### V1.0.4（当前版本，2025-11-26）
- ✅ ChessProperty现代化重写
- ✅ 修复9个API兼容性Bug
- ✅ 文档精简（76→9个）

### V1.0.3（2025-11-26）
- ✅ Mixin拆分尝试→失败→回滚
- ✅ 修复8个初始化顺序Bug

### V1.0.2（2025-11-26）
- ✅ ChessProperty Mixin拆分
- ✅ 代码优化（RandomUtils, GameConstants）

### V1.0.1（2025-11-26）
- ✅ 代码优化和清理
- ✅ 35个TODO清理

### V1.0（2025-11-26）
- ✅ 1:1完整复刻完成
- ✅ 所有系统100%实现
- ✅ 自动游戏AI系统
- ✅ 数据库分离架构

---

## 🎯 未来计划（V1.1+）

**可能的方向**：
1. 音频系统（BGM和音效）
2. 移动端适配（WeChat Mini-Games）
3. 新内容扩展（更多天赋、遗物、事件）
4. UI/UX增强（更好的动画和提示）
5. 性能优化
6. Wiki功能增强

**开发模式**：自由扩展，不受原版限制

---

## 📜 许可证

本项目为个人学习和非商业用途。

---

## 🙏 致谢

- 感谢 **CreateJS 团队** 提供优秀的HTML5游戏框架
- 感谢 **原版游戏作者** 创造了这款优秀的游戏
- 感谢所有参与测试和反馈的玩家

---

## 📞 联系方式

- 项目仓库：[GitHub](https://github.com/icescat/hero-chess)
- 在线游玩：[GitHub Pages](https://icescat.github.io/hero-chess/)
- 游戏Wiki：[rollhero/index.html](rollhero/index.html)
- 问题反馈：通过Issue提交

---

## 🚢 GitHub 部署规则

**重要**：本地项目结构与 GitHub 仓库结构不同，部署时需要重新组织：

| 本地路径 | GitHub 仓库路径 | 说明 |
|----------|----------------|------|
| `src/*` | `/`（仓库根目录） | 游戏源码提到根目录 |
| `src/wiki/` | `/wiki/` | Wiki 百科 |
| `rollhero/` | 不推送 | 开发用 Wiki 源文件 |
| `SWF/` | 不推送 | 原始反编译资源 |
| `docs/` | 不推送 | 开发文档 |
| `.codegraph/` | 不推送 | 代码索引 |
| `.trae/` | 不推送 | IDE 配置 |

**README 区别**：
- 本地 `README.md`：开发文档（本文件），面向开发者
- `src/README.md`：玩家文档，面向游戏玩家，部署后成为 GitHub 仓库根 README

**部署方式**：使用 `deploy` 分支通过 `git read-tree` 将 `src/` 提到根目录后 force push 到 `main`。

---

**最后更新**：2025-11-26  
**当前版本**：V1.0.4  
**完成度**：100%（核心游戏）