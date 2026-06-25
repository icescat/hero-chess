/**
 * 海滩事件详细数据
 * 位置：#4, #17, #26, #36（4个海滩格）
 */

const BEACH_EVENTS = {
    id: 'beach',
    title: '🏖️ 海滩',
    description: '路上随机事件触发地，可能遇到海盗、宝藏、美人鱼等',
    location: '#4, #17, #26, #36',
    events: [
        {
            name: '遇到海盗',
            probability: '路上随机事件',
            trigger: '走过海滩时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏴‍☠️ 海盗袭击</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 战斗</div>
                        <div class="node-detail">海盗（精英级）<br>等级 = 玩家等级 + 1</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">丰厚奖励<br>金钱+材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡或被劫财</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（中等概率）',
                '敌人：海盗（精英级）',
                '等级：玩家等级+1',
                '胜利：奖励比普通敌人丰厚',
                '失败：死亡或损失部分金钱',
                '⚠️ 比普通敌人更强'
            ]
        },
        {
            name: '发现宝藏',
            probability: '路上随机事件',
            trigger: '走过海滩时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏴‍☠️ 海盗宝藏</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💰 金钱</div>
                                <div class="node-detail">500-1500金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💎 材料</div>
                                <div class="node-detail">稀有锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">⚔️ 装备</div>
                                <div class="node-detail">高级装备</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '奖励：金钱、稀有材料或高级装备',
                '💡 海滩宝藏质量较高'
            ]
        },
        {
            name: '美人鱼事件',
            probability: '路上随机事件',
            trigger: '走过海滩时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🧜‍♀️ 遇到美人鱼</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">💝 获得祝福</div>
                                <div class="node-detail">全属性临时提升<br>或恢复状态</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🎁 获得礼物</div>
                                <div class="node-detail">材料或装备</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '效果：祝福（Buff）或礼物',
                '祝福：全属性+10%，持续3回合',
                '礼物：材料或装备',
                '💡 海滩特有的好事件'
            ]
        },
        {
            name: '海边休息',
            probability: '路上随机事件',
            trigger: '走过海滩时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🌊 海边休息</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 恢复状态</div>
                        <div class="node-detail">生命+20%<br>耐力+20%</div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（中等概率）',
                '效果：恢复20%生命和耐力',
                '💡 海滩特有的休息事件'
            ]
        },
        {
            name: '大浪袭击',
            probability: '路上随机事件',
            trigger: '走过海滩时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🌊 大浪来袭</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">💰 损失财物</div>
                                <div class="node-detail">金钱-5%</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❤️ 受伤</div>
                                <div class="node-detail">生命-10%</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '效果：损失金钱或受伤',
                '⚠️ 海滩特有的负面事件'
            ]
        },
        {
            name: '无事发生',
            probability: '路上随机事件',
            trigger: '走过海滩时',
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
                '💡 安全过关'
            ]
        }
    ]
};


