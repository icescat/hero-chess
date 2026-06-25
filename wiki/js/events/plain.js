/**
 * 平原事件详细数据
 * 位置：#1, #11, #20, #33（4个平原格）
 */

const PLAIN_EVENTS = {
    id: 'plain',
    title: '🌾 平原',
    description: '路上随机事件触发地，可能遇到敌人、宝箱、商人等',
    location: '#1, #11, #20, #33',
    events: [
        {
            name: '路遇敌人',
            probability: '路上随机事件',
            trigger: '走过平原时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👹 遇到敌人</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 战斗</div>
                        <div class="node-detail">等级 = 玩家等级 ± 2<br>普通敌人</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">经验+金钱+材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡，传送回城复活</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（较高概率）',
                '敌人：哥布林、山贼、野兽等',
                '等级：玩家等级±2',
                '奖励：经验、金钱、材料',
                '💡 练级的主要途径'
            ]
        },
        {
            name: '发现宝箱',
            probability: '路上随机事件',
            trigger: '走过平原时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📦 发现宝箱</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💰 金钱</div>
                                <div class="node-detail">100-500金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">📦 材料</div>
                                <div class="node-detail">锻材或稀有锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">⚔️ 装备</div>
                                <div class="node-detail">随机装备</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（中等概率）',
                '奖励：金钱、材料或装备',
                '💡 运气好能捡到装备'
            ]
        },
        {
            name: '遇到商人',
            probability: '路上随机事件',
            trigger: '走过平原时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🧙 遇到商人</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💱 交易</div>
                        <div class="node-detail">买卖物品</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💰 出售物品</div>
                                <div class="node-detail">卖掉多余材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 购买物品</div>
                                <div class="node-detail">买材料/装备</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '功能：买卖物品',
                '💡 可以卖掉多余材料换金'
            ]
        },
        {
            name: '无事发生',
            probability: '路上随机事件',
            trigger: '走过平原时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🚶 平静前进</div>
                        <div class="node-detail">什么都没发生</div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机（一定概率）',
                '效果：无事发生，安全通过',
                '💡 有时候平静也是好事'
            ]
        }
    ]
};


