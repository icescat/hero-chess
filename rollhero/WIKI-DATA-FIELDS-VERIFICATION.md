# Wiki数据字段核实报告

## 📊 游戏实际数据结构（来自JSON文件）

### 1. 装备数据 (equips.json)

#### 武器 (weapons)
```json
{
  "setNo": 0,           // 套装编号
  "name": "青铜短剑",    // 名称
  "attack": 10,         // 攻击力
  "quality": 0          // 品质（0-4：普通/优秀/精良/史诗/传说）
}
```
**✅ 实际存在的字段**: `setNo`, `name`, `attack`, `quality`
**❌ 不存在的字段**: `weight`, `reqLevel`, `baseFee`, `sellPrice`

#### 护甲 (armors)
```json
{
  "setNo": 0,           // 套装编号
  "name": "青铜胸甲",    // 名称
  "defense": 5,         // 防御力
  "life": 100,          // 生命值
  "quality": 0          // 品质
}
```
**✅ 实际存在的字段**: `setNo`, `name`, `defense`, `life`, `quality`
**❌ 不存在的字段**: `weight`, `reqLevel`, `baseFee`, `sellPrice`

### 2. 坐骑数据 (mounts.json)

#### 基础坐骑 (baseMounts)
```json
{
  "mountNo": 1,              // 坐骑编号
  "name": "普通的马",         // 名称
  "attack": 30,              // 攻击加成
  "speed": 1,                // 速度等级
  "speedName": "一般",        // 速度描述
  "weight": 50,              // 负重加成
  "staConsumeReduce": 1,     // 耐力消耗减少
  "growrate": 0.8,           // 成长率
  "injurerate": 0.12,        // 负伤率
  "isUnique": true,          // （可选）是否传说坐骑
  "canWaterRun": true,       // （可选）能否水上行走
  "noInjure": true           // （可选）是否永不受伤
}
```
**✅ 实际存在的字段**: `mountNo`, `name`, `attack`, `weight`, `staConsumeReduce`, `growrate`, `isUnique`, `canWaterRun`
**❌ 不存在的字段**: `baseFee`, `maxGeneration`（这些是游戏内部动态计算的）
**⚠️ 已废弃字段（V1.0.6）**: `speed`, `speedName`, `injurerate`, `noInjure`

#### 背包系统 (bags.json) - V1.0.6新增
```json
{
  "level": 1,                // 背包等级
  "name": "粗布包",           // 名称
  "weight": 50,              // 负重加成
  "upgradeCost": 0,          // 升级金钱（0=初始背包）
  "upgradeStuff": 0,         // 升级所需锻材
  "description": "..."       // 描述
}
```
**✅ 实际存在的字段**: `level`, `name`, `weight`, `upgradeCost`, `upgradeStuff`, `description`

#### ~~马车系统 (已废弃)~~
马车系统在V1.0.6中已被背包系统取代

### 3. Buff数据 (buffs.json)

```json
{
  "buffNo": 1,               // Buff编号
  "name": "心满意足",         // 名称
  "type": 3,                 // 类型
  "lifeMul": 0.2,            // 生命倍率（+20% = 0.2）
  "atkMul": 0.2,             // 攻击倍率
  "defMul": 0.2,             // 防御倍率
  "staMul": 0.2,             // 耐力倍率
  "wgtMul": 0.2,             // 负重倍率
  "duration": 3,             // 持续回合数（0=永久）
  "isDebuff": false,         // 是否负面Buff
  "isItem": false,           // 是否消耗品
  "fee": 0,                  // 参考价格
  "description": "..."       // 效果描述
}
```
**✅ 实际存在的字段**: 所有字段都存在
**❌ 不存在的字段**: 无

### 4. 遗物数据 (relics.json)

```json
{
  "relicNo": 1,              // 遗物编号
  "name": "逸风之靴",         // 名称
  "desc": "耐力消耗-1",       // 效果描述
  "type": 1,                 // 类型
  "isLegend": false,         // 是否传说
  "special": "soulstone"     // （可选）特殊标记
}
```
**✅ 实际存在的字段**: `relicNo`, `name`, `desc`, `type`, `isLegend`, `special`
**❌ 不存在的字段**: `intro`, `lifeAdd`, `atkAdd`, `defAdd`, `staAdd`, `wgtAdd`, `fee`

---

## 🔍 当前Wiki表格使用的字段检查

### ✅ 遗物表格 - 正确
- 编号 (`relicNo`) ✅
- 遗物名称 (`name`) ✅  
- 等级 (`isLegend`) ✅
- 效果描述 (`desc`) ✅
- 获取方式（推断，非数据库字段） ✅

### ✅ 装备表格 - 正确

**武器：**
- 套装编号 (`setNo`) ✅
- 装备名称 (`name`) ✅
- 品质 (`quality`) ✅
- 攻击力 (`attack`) ✅

**护甲：**
- 套装编号 (`setNo`) ✅
- 装备名称 (`name`) ✅
- 品质 (`quality`) ✅
- 防御力 (`defense`) ✅
- 生命值 (`life`) ✅

### ✅ Buff表格 - 正确
- 编号 (`buffNo`) ✅
- 名称 (`name`) ✅
- 效果描述 (`description`) ✅
- 属性影响 (`lifeMul`, `atkMul`, `defMul`, `staMul`, `wgtMul`) ✅
- 持续时间 (`duration`) ✅

### ✅ 坐骑表格 - 正确 (V1.0.6更新)

**普通/传说坐骑：**
- 坐骑名称 (`name`) ✅
- 攻击加成 (`attack`) ✅
- 负重加成 (`weight`) ✅
- 耐力减少 (`staConsumeReduce`) ✅
- 成长率 (`growrate`) ✅
- 特殊能力 (`canWaterRun`) ✅

**⚠️ 已废弃字段（V1.0.6）：**
- ~~速度等级 (`speed`, `speedName`)~~ - 已删除
- ~~负伤率 (`injurerate`, `noInjure`)~~ - 已删除

**背包系统（V1.0.6新增）：**
- 等级 (`level`) ✅
- 背包名称 (`name`) ✅
- 负重加成 (`weight`) ✅
- 升级金钱 (`upgradeCost`) ✅
- 升级材料 (`upgradeStuff`) ✅
- 描述 (`description`) ✅

**~~马车系统~~（V1.0.6已废弃）：**
- 已被背包系统取代

---

## ✅ 核实结论

**所有Wiki表格显示的字段都来自真实的游戏JSON数据，没有脑补或虚构的字段！**

移除的不存在字段：
- ❌ 装备的"负重"、"要求等级"、"购买价格"、"出售价格"
- ❌ 坐骑的"购买价格"、"可成长代数"
- ❌ 遗物的"属性加成"、"参考价格"
- ❌ Buff的"参考价格"（虽然字段存在，但大多数是0，显示意义不大）

---

**核实日期**: 2025-12-02
**核实人**: AI Assistant
**数据来源**: `src/assets/data/*.json` 游戏数据文件





