/**
 * 副本事件详细数据
 * 位置：#7和#21
 * 
 * V1.0.6：删除临时随从功能，必须携带随从才能进副本
 */

const DUNGEON_EVENTS = {
    id: 'dungeon',
    title: '🚪 副本',
    description: '探索地下城，连续战斗获得大量材料和装备，必须携带随从才能进入',
    location: '#7和#21（两个副本）',
    events: [
        {
            name: '攻略副本',
            probability: '玩家选择',
            trigger: '副本未完成且携带随从时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🚪 进入副本</div>
                        <div class="node-detail">必须携带随从</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">⚔️ 连续战斗</div>
                        <div class="node-detail">小怪 → 精英 → BOSS → 宝箱<br>循环直到完成</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">👹 小怪</div>
                                <div class="node-detail">较弱，掉落普通材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">💀 精英</div>
                                <div class="node-detail">中等强度<br>掉落稀有材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">👑 BOSS</div>
                                <div class="node-detail">很强<br>大量材料+装备</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🎁 副本完成</div>
                        <div class="node-detail">可选择重置或刷副本</div>
                    </div>
                </div>
            `,
            details: [
                '⚠️ 必须携带随从才能进入副本',
                '流程：进入 → 战斗 → 宝箱 → 重复',
                '战斗顺序：小怪 → 精英 → BOSS（循环）',
                '每层消耗：40%耐力',
                '奖励：大量材料 + 装备',
                '完成后：',
                '  ① 可选择重置继续刷',
                '  ② 可选择快速掠夺',
                '⚠️ 耐力不足会被迫逃离',
                '⚠️ 战败会死亡并重置副本'
            ]
        },
        {
            name: '无随从门口打野怪',
            probability: '自动触发',
            trigger: '没有携带随从时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⚠️ 没有随从</div>
                        <div class="node-detail">无法进入副本</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💡 门口练级</div>
                        <div class="node-detail">独自一人进入难以为继<br>决定在门口找小怪练手</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">⚔️ 战斗小怪</div>
                        <div class="node-detail">与普通怪物战斗<br>获得经验和少量材料</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">获得经验和奖励<br>回合结束</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡复活</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：没有携带随从时自动触发',
                '效果：门口强制战斗小怪',
                '原因：副本凶险，独自一人难以应对',
                '奖励：少量经验和材料',
                '💡 建议先招募随从再来攻略'
            ]
        },
        {
            name: '重置副本',
            probability: '玩家选择',
            trigger: '副本完成后可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🔄 重置副本</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 消耗材料</div>
                        <div class="node-detail">少量锻材<br>重置副本进度</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 重置完成</div>
                        <div class="node-detail">副本恢复初始状态<br>可重新攻略</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚡ 立即进入</div>
                        <div class="node-detail">重置后直接开始攻略</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：少量材料',
                '效果：副本恢复初始状态',
                '用途：重复刷材料和装备',
                '⚠️ 重置后立即进入副本'
            ]
        },
        {
            name: '掠夺（刷副本）',
            probability: '玩家选择',
            trigger: '副本完成后可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⚡ 快速掠夺</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">⚡ 消耗40%耐力</div>
                        <div class="node-detail">无需战斗</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🎁 快速获得奖励</div>
                        <div class="node-detail">根据副本等级<br>直接获得材料和装备</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💡 效率对比</div>
                        <div class="node-detail">掠夺：快速，固定奖励<br>攻略：慢，奖励更丰富</div>
                    </div>
                </div>
            `,
            details: [
                '条件：副本已完成',
                '消耗：40%耐力',
                '效果：直接获得材料和装备',
                '特点：无需战斗，快速刷材料',
                '奖励：略少于正常攻略',
                '💡 适合快速刷材料'
            ]
        },
        {
            name: '英雄模式',
            probability: '特殊条件',
            trigger: '副本完成且满足条件',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🔥 英雄模式</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 敌人强化</div>
                        <div class="node-detail">血量×2<br>攻击×1.5<br>防御×1.5</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">🎁 奖励翻倍</div>
                        <div class="node-detail">材料×2<br>装备品质更高</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 成功</div>
                                <div class="node-detail">丰厚奖励</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡，副本重置</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：副本完成后可开启',
                '难度：敌人血量×2，攻防×1.5',
                '奖励：材料×2，装备品质提升',
                '风险：更高，但收益也更高',
                '⚠️ 建议高等级高装备再挑战'
            ]
        },
        {
            name: '宝箱怪事件',
            probability: '20%概率',
            trigger: '副本战斗后判定（间隔>1圈）',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📦 发现宝箱</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">👹 宝箱怪！</div>
                        <div class="node-detail">伪装的怪物</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制战斗</div>
                        <div class="node-detail">特殊敌人<br>血厚防高</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">额外宝箱<br>稀有材料+装备</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡，副本重置</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：20%概率，需间隔1圈以上',
                '敌人：宝箱怪（特殊类型）',
                '属性：高生命，高防御',
                '胜利：额外宝箱+稀有材料+装备',
                '失败：死亡，副本重置',
                '💡 值得一战的高价值目标'
            ]
        },
        {
            name: '神龛事件',
            probability: '随机触发',
            trigger: '副本中随机',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⛩️ 发现神龛</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🙏 祈祷</div>
                                <div class="node-detail">获得临时Buff</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 奉献</div>
                                <div class="node-detail">花费金钱<br>获得更强Buff</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：副本中随机',
                '效果：获得临时战斗Buff',
                '祈祷：免费，普通Buff',
                '奉献：花费金钱，强力Buff',
                '💡 有助于击败BOSS'
            ]
        }
    ]
};


