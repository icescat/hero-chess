/**
 * 林地事件详细数据
 * 位置：#3, #13, #22, #31（4个林地格）
 */

const FOREST_EVENTS = {
    id: 'forest',
    title: '🌲 林地',
    description: '路上随机事件触发地，可能遇到敌人、药草、猎物等',
    location: '#3, #13, #22, #31',
    events: [
        {
            name: '路遇敌人',
            probability: '路上随机事件',
            trigger: '走过林地时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🐺 森林敌人</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 战斗</div>
                        <div class="node-detail">野兽、盗贼等<br>等级 = 玩家等级 ± 2</div>
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
                '敌人：野狼、熊、森林盗贼等',
                '等级：玩家等级±2',
                '奖励：经验、金钱、材料',
                '💡 森林敌人可能掉落特殊材料'
            ]
        },
        {
            name: '采集药草',
            probability: '路上随机事件',
            trigger: '走过林地时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🌿 发现药草</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 采集成功</div>
                        <div class="node-detail">恢复生命或耐力<br>或获得材料</div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（中等概率）',
                '效果：恢复生命10-20点或耐力10-20点',
                '或：获得1-3锻材',
                '💡 森林特有，小补给'
            ]
        },
        {
            name: '狩猎野兽',
            probability: '路上随机事件',
            trigger: '走过林地时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🦌 发现猎物</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🏹 狩猎成功</div>
                                <div class="node-detail">获得金钱+材料<br>无需战斗</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 惊动猎物</div>
                                <div class="node-detail">逃跑了</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（中等概率）',
                '成功：200-500金 + 材料',
                '失败：什么都没有',
                '💡 安全的收入途径'
            ]
        },
        {
            name: '迷路事件',
            probability: '路上随机事件',
            trigger: '走过林地时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🌀 迷路了</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node fail">
                        <div class="node-content">⚡ 消耗额外耐力</div>
                        <div class="node-detail">耐力-10%</div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '效果：额外消耗10%耐力',
                '⚠️ 森林特有的负面事件'
            ]
        },
        {
            name: '精灵祝福',
            probability: '路上随机事件',
            trigger: '走过林地时触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🧚 遇到精灵</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">✨ 精灵祝福</div>
                        <div class="node-detail">获得临时Buff<br>攻防提升</div>
                    </div>
                </div>
            `,
            details: [
                '触发：路上随机事件（低概率）',
                '效果：攻击和防御临时+10%',
                '持续：3回合',
                '💡 森林特有的好事件'
            ]
        },
        {
            name: '无事发生',
            probability: '路上随机事件',
            trigger: '走过林地时',
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


