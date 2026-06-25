/**
 * 房屋事件详细数据
 * 位置：#5和#24
 */

const HOUSE_EVENTS = {
    id: 'house',
    title: '🏠 房屋',
    description: '6阶段建设家园，获得金钱收益，解锁家庭活动',
    location: '#5和#24（两块空地）',
    events: [
        {
            name: '房屋建设',
            probability: '玩家投资',
            trigger: '房屋未完成时可投资',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏗️ 房屋建设</div>
                        <div class="node-detail">6个阶段</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">阶段1（首付）</div>
                        <div class="node-detail">30000金（名声<500）<br>60000金（名声500-1000）<br>100000金（名声1000+）</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">阶段2-5</div>
                                <div class="node-detail">各20000金<br>提升收益</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">阶段6</div>
                                <div class="node-detail">20000金<br>全功能解锁</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🎉 房屋完成</div>
                        <div class="node-detail">解锁：睡觉、训练、炼金、派对<br>可带妻子回家</div>
                    </div>
                </div>
            `,
            details: [
                '阶段1（首付）：',
                '  名声<500：30000金',
                '  名声500-1000：60000金',
                '  名声1000+：100000金',
                '阶段2-6：各20000金',
                '总投资：30000-100000 + 20000×5 = 130000-200000金',
                '⚠️ 名声越高首付越贵',
                '⚠️ 完成后才能带妻子回家'
            ]
        },
        {
            name: '金钱收益',
            probability: '自动触发',
            trigger: '每圈经过起点（0号格）',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💰 收取房租</div>
                        <div class="node-detail">经过起点自动触发</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📊 收益计算</div>
                        <div class="node-detail">根据房屋阶段<br>阶段越高收益越多</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">阶段1-2</div>
                                <div class="node-detail">500-1000金/圈</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">阶段3-4</div>
                                <div class="node-detail">1500-2500金/圈</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">阶段5-6</div>
                                <div class="node-detail">3000-5000金/圈</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：每圈经过0号格（起点）',
                '收益：根据房屋阶段递增',
                '特点：被动收入，不需操作',
                '💡 后期重要的收入来源',
                '💡 投资回报周期约20-30圈'
            ]
        },
        {
            name: '在家休息',
            probability: '玩家选择',
            trigger: '房屋建成后可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💤 在家睡觉</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 完全恢复</div>
                        <div class="node-detail">生命和耐力100%<br>免费无消耗</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：无（完全免费）',
                '效果：完全恢复生命和耐力',
                '⚠️ 比城镇住宿更划算（免费）'
            ]
        },
        {
            name: '在家训练',
            probability: '玩家选择',
            trigger: '房屋完成 + 有随从',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💪 训练随从</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 等级×10金</div>
                        <div class="node-detail">训练费用</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">⭐ 随从升级</div>
                        <div class="node-detail">随从等级+1<br>属性提升</div>
                    </div>
                </div>
            `,
            details: [
                '条件：房屋完成 + 有随从',
                '费用：随从等级×10金',
                '效果：随从等级+1',
                '💡 比营地训练更方便'
            ]
        },
        {
            name: '炼金术',
            probability: '玩家选择',
            trigger: '房屋完成 + 学习炼金天赋',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🧪 炼金术</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 材料消耗</div>
                        <div class="node-detail">锻材 → 稀有锻材<br>或其他转换</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">👰 妻子加成</div>
                        <div class="node-detail">村长女儿：成功率提升</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 成功</div>
                                <div class="node-detail">获得高级材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">材料消耗</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '条件：房屋完成 + 学习炼金天赋',
                '效果：转换材料',
                '妻子加成：村长女儿提升成功率',
                '⚠️ 需要先学习炼金术天赋'
            ]
        },
        {
            name: '家庭派对',
            probability: '玩家选择',
            trigger: '房屋完成 + 有妻子',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎉 家庭派对</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">💕 增进感情</div>
                        <div class="node-detail">妻子亲密度提升<br>获得临时Buff</div>
                    </div>
                </div>
            `,
            details: [
                '条件：房屋完成 + 有妻子',
                '效果：提升妻子亲密度，获得Buff',
                '💡 增进夫妻感情'
            ]
        },
        {
            name: '黄金史莱姆Boss战',
            probability: '10%概率（圈数>2）',
            trigger: '到达房屋时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💛 黄金史莱姆</div>
                        <div class="node-detail">占领了你的地盘</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制Boss战</div>
                        <div class="node-detail">精英级史莱姆<br>等级 = max(10, 玩家等级+5)</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">💰 金钱+30000<br>"炼成金锭"</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡，传送回城复活<br>史莱姆继续占领</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">♻️ 持续性</div>
                        <div class="node-detail">失败后史莱姆不走<br>下次必定触发战斗</div>
                    </div>
                </div>
            `,
            details: [
                '触发：10%概率，需要圈数>2',
                '敌人：黄金史莱姆（精英级Boss）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利奖励：金钱+30000（高额！）',
                '失败：死亡，史莱姆继续占领地盘',
                '持续性：失败后下次来必定触发',
                '⚠️ 高风险高回报',
                '💰 游戏中最赚钱的Boss之一'
            ]
        },
        {
            name: '日光马戏团',
            probability: '20%概率（白天）',
            trigger: '到达房屋白天时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎪 日光马戏团</div>
                        <div class="node-detail">来此演出</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🎭 精彩演出</div>
                        <div class="node-detail">大饱眼福</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">金钱<5000</div>
                            <div class="tree-node info">
                                <div class="node-content">💸 囊中羞涩</div>
                                <div class="node-detail">看完演出就离开</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">金钱≥5000</div>
                            <div class="tree-node highlight">
                                <div class="node-content">🛒 购买道具</div>
                                <div class="node-detail">随机1件特殊道具</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎁 可购买道具</div>
                        <div class="node-detail">灵魂石、灯塔、金色染料<br>水上飘、香水、胡萝卜</div>
                    </div>
                </div>
            `,
            details: [
                '触发：20%概率，仅白天触发',
                '条件：金钱≥5000才能购买道具',
                '可购买道具（随机1件）：',
                '  ① 灵魂石（遗物，3000金）- 战斗死亡时满血复活',
                '  ② 灯塔（Buff）- 传送功能增强',
                '  ③ 金色染料（Buff）- 声望获取+50%',
                '  ④ 水上飘（Buff）- 水上行走',
                '  ⑤ 香水（Buff）- 随从好感获取翻倍',
                '  ⑥ 胡萝卜（Buff）- 马匹速度提升',
                '💡 灵魂石极其珍贵，遇到必买',
                '💡 金色染料和香水也很实用'
            ]
        }
    ]
};


