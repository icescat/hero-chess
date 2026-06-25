# 游戏数据库

这个目录存放所有游戏数据的JSON文件。

## 📁 文件说明

| 文件 | 说明 | 状态 |
|------|------|------|
| `buffs.json` | Buff数据（24个） | ✅ 已完成 |
| `relics.json` | 遗物数据（18个） | ✅ 已完成 |
| `equips.json` | 装备数据（武器16+护甲16） | ✅ 已完成 |
| `materials.json` | 材料需求（16个） | ✅ 已完成 |
| `mounts.json` | 坐骑数据（6基础+2高级+6马车） | ✅ 已完成 |
| `followers.json` | 随从数据（5职业×4技能+5等级） | ✅ 已完成 |

## 🎮 数据格式

### buffs.json
```json
{
  "buffNo": 1,
  "key": "SATISFIED",
  "name": "心满意足",
  "type": 3,
  "lifeMul": 0.2,
  "duration": 3,
  "isDebuff": false,
  "effectText": "全属性+20%",
  "description": "与伴侣共度良宵后的满足感"
}
```

### relics.json
```json
{
  "relicNo": 1,
  "name": "逸风之靴",
  "type": 1,
  "isLegend": false,
  "effectText": "耐力消耗-1",
  "description": "传说中勇者穿过的神奇靴子"
}
```

### equips.json
```json
{
  "qualityNames": ["普通", "优秀", "精良", "史诗", "传奇"],
  "qualityColors": ["#FFFFFF", "#0080FF", "#00FF00", "#FFD700", "#FF8000"],
  "weapons": [
    {
      "setNo": 0,
      "name": "青铜短剑",
      "attack": 10,
      "quality": 0,
      "description": "新手冒险者的标配武器"
    }
  ],
  "armors": [
    {
      "setNo": 0,
      "name": "青铜胸甲",
      "defense": 5,
      "life": 100,
      "quality": 0,
      "description": "新手冒险者的标配护甲"
    }
  ]
}
```

### materials.json
```json
{
  "setNo": 3,
  "stuff": 24,
  "rare": 6
}
```

### mounts.json
```json
{
  "baseMounts": [
    {
      "mountNo": 1,
      "name": "普通的马",
      "attack": 30,
      "speed": 1,
      "speedName": "一般",
      "weight": 50,
      "staConsumeReduce": 1,
      "growrate": 0.8,
      "injurerate": 0.12
    }
  ],
  "carriages": [
    {
      "level": 1,
      "name": "简易马车",
      "extraWeight": 100,
      "baseFee": 40000
    }
  ]
}
```

### followers.json
```json
{
  "jobs": [
    {
      "jobNo": 1,
      "name": "战士",
      "key": "warrior",
      "description": "近战肉盾型职业",
      "lifeRatio": 0.5,
      "attackRatio": 0.2,
      "skills": [
        {
          "skillNo": 1,
          "name": "盾反",
          "intro": "反弹敌人造成的伤害",
          "type": "battle",
          "effectText": "受到伤害时反弹30%"
        }
      ]
    }
  ],
  "ranks": [
    {
      "rank": 1,
      "rankName": "菜鸟",
      "levelBase": 18,
      "recruitFee": 50,
      "description": "刚入行的新手"
    }
  ]
}
```

## 🔧 数据修改

1. 直接编辑JSON文件
2. 刷新游戏页面即可看到效果
3. Git会自动追踪修改记录

## ⚠️ 注意事项

- 修改数据时保持JSON格式正确
- buffNo、type等数值字段不要加引号
- 修改后可用在线工具验证JSON格式
- `effectText` 字段用于游戏内显示效果文案
- `description` 字段用于详细描述

