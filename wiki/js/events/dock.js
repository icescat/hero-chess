/**
 * 码头事件详细数据
 * 位置：#8和#27
 */

const DOCK_EVENTS = {
    id: 'dock',
    title: '⚓ 码头',
    description: '5阶段建设，解锁钓鱼、坐船、贸易功能，可登岛探险',
    location: '#8和#27（两个码头）',
    events: [
        {
            name: '码头建设',
            probability: '玩家投资',
            trigger: '码头未完成时可投资',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏗️ 码头建设</div>
                        <div class="node-detail">5个阶段</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">阶段1</div>
                                <div class="node-detail">50000金<br>解锁渔船</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">阶段2-4</div>
                                <div class="node-detail">各20000金<br>船只升级</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">阶段5</div>
                                <div class="node-detail">20000金<br>全功能解锁</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 建设完成</div>
                        <div class="node-detail">解锁：贸易、登岛<br>可购买幽冥战马</div>
                    </div>
                </div>
            `,
            details: [
                '总投资：50000 + 20000×4 = 130000金',
                '阶段1（50000金）：解锁渔船，可钓鱼',
                '阶段2（20000金）：船只升级',
                '阶段3（20000金）：船只升级',
                '阶段4（20000金）：船只升级',
                '阶段5（20000金）：完成！解锁贸易和登岛',
                '⚠️ 投资后立即生效',
                '⚠️ 两个码头独立建设'
            ]
        },
        {
            name: '钓鱼',
            probability: '玩家选择',
            trigger: '码头阶段1+完成',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎣 钓鱼</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">⚡ 消耗30%耐力</div>
                        <div class="node-detail">专心钓鱼</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">60%</div>
                            <div class="tree-node success">
                                <div class="node-content">🐟 普通收获</div>
                                <div class="node-detail">5-10锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">30%</div>
                            <div class="tree-node success">
                                <div class="node-content">💎 稀有收获</div>
                                <div class="node-detail">2-5稀有锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">10%</div>
                            <div class="tree-node fail">
                                <div class="node-content">❌ 空手而归</div>
                                <div class="node-detail">什么都没钓到</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '条件：码头阶段1+完成',
                '消耗：30%耐力',
                '奖励：',
                '  60% - 5-10普通锻材',
                '  30% - 2-5稀有锻材',
                '  10% - 空手而归',
                '💡 获取材料的好途径'
            ]
        },
        {
            name: '坐船登岛',
            probability: '玩家选择',
            trigger: '码头阶段5完成',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⛵ 坐船出海</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎯 选择目的地</div>
                        <div class="node-detail">仙人岛 或 魔王岛</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🏝️ 仙人岛</div>
                                <div class="node-detail">6种随机事件<br>相对安全</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">🌋 魔王岛</div>
                                <div class="node-detail">高风险高回报<br>终极挑战</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">🚢 瞬移到岛</div>
                        <div class="node-detail">不消耗骰子点数<br>直接传送</div>
                    </div>
                </div>
            `,
            details: [
                '条件：码头阶段5完成',
                '消耗：无（免费传送）',
                '目的地：',
                '  🏝️ 仙人岛 - 6种随机事件，收益稳定',
                '  🌋 魔王岛 - 危险区域，终极挑战',
                '特点：瞬移，不消耗步数',
                '⚠️ 两个岛屿都需要船只才能到达'
            ]
        },
        {
            name: '贸易',
            probability: '玩家选择',
            trigger: '码头阶段5完成',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💱 材料贸易</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📊 市场价格</div>
                        <div class="node-detail">买价和卖价波动<br>低买高卖赚差价</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 购买材料</div>
                                <div class="node-detail">花费金钱<br>获得锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💰 出售材料</div>
                                <div class="node-detail">消耗锻材<br>获得金钱</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '条件：码头阶段5完成',
                '功能：买卖材料赚差价',
                '价格：随机波动',
                '策略：低价买入，高价卖出',
                '⚠️ 注意：当前版本功能可能未完全实现'
            ]
        },
        {
            name: '购买幽冥战马',
            probability: '玩家选择',
            trigger: '码头阶段5完成',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🐴 幽冥战马</div>
                        <div class="node-detail">传说级坐骑</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 30000金</div>
                        <div class="node-detail">昂贵但值得</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">✨ 特殊效果</div>
                        <div class="node-detail">-4耐力消耗（最强）<br>+水上行走能力</div>
                    </div>
                </div>
            `,
            details: [
                '条件：码头阶段5完成',
                '价格：30000金',
                '效果：',
                '  ⚡ 移动耐力消耗-4（最强坐骑）',
                '  🌊 水上行走（可直接走过水面格子）',
                '  📈 可继续训练成长',
                '⚠️ 最贵但也最强的坐骑'
            ]
        },
        {
            name: '追加投资',
            probability: '玩家选择',
            trigger: '码头建设中可追加',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💰 追加投资</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 额外金钱</div>
                        <div class="node-detail">加速建设进度</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">⚡ 建设加速</div>
                        <div class="node-detail">更快完成建设</div>
                    </div>
                </div>
            `,
            details: [
                '作用：加速码头建设',
                '方式：额外投资金钱',
                '💡 有钱可以加速完成'
            ]
        }
    ]
};


