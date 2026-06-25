/**
 * 营地事件详细数据
 * 位置：#18
 */

const CAMP_EVENTS = {
    id: 'camp',
    title: '⛺ 营地',
    description: '雇佣和训练随从的地方，可能触发特殊Boss战',
    location: '#18',
    events: [
        {
            name: '雇佣随从',
            probability: '玩家选择',
            trigger: '每次到达且无随从时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📋 选择雇佣随从</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎲 随机生成</div>
                        <div class="node-detail">职业、性别、等级、Rank随机</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">👥 职业（6种）</div>
                                <div class="node-detail">战士、盗贼、游侠<br>法师、牧师、精灵</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">⭐ Rank（1-5）</div>
                                <div class="node-detail">Rank越高越强</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 费用</div>
                        <div class="node-detail">基础2000金 + Rank×1000金<br>+ 材料（随等级和Rank）</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 雇佣成功</div>
                                <div class="node-detail">随从加入队伍</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 放弃雇佣</div>
                                <div class="node-detail">离开营地</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '条件：当前没有随从',
                '费用：2000 + Rank×1000 金 + 材料',
                'Rank：1-5，Rank越高属性越强',
                '职业效果：',
                '  战士：防御高',
                '  盗贼：背刺、浸毒',
                '  游侠：乱射、瞄准',
                '  法师：炎爆术',
                '  牧师：治疗、祝福',
                '  精灵：特殊能力',
                '⚠️ 最多只能带1个随从',
                '⚠️ 雇佣新随从会解雇旧随从'
            ]
        },
        {
            name: '训练随从',
            probability: '已移除',
            trigger: 'V1.0版本已无此功能',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node info">
                        <div class="node-content">⚠️ 功能已移除</div>
                        <div class="node-detail">V1.0版本不支持营地训练随从</div>
                    </div>
                </div>
            `,
            details: [
                '说明：营地不再提供训练随从功能',
                '替代方案：在家园中训练随从（需建房）'
            ]
        },
        {
            name: '乌鸦王Boss战',
            probability: '10%概率',
            trigger: '到达营地时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👑 遇到乌鸦王</div>
                        <div class="node-detail">营地质量Boss</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制战斗</div>
                        <div class="node-detail">Boss级敌人<br>等级 = 玩家等级 + 调整</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">营地质量提升<br>后续雇佣随从更强</div>
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
                '触发：10%概率，到达营地时自动判定',
                '敌人：乌鸦王（精英级Boss）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利效果：后续雇佣的随从初始亲密度更高',
                '失败：死亡，传送回最近城镇复活',
                '⚠️ 建议至少10级以上再挑战'
            ]
        },
        {
            name: '集结先遣军',
            probability: '特殊条件',
            trigger: '名声1500+ 且 在营地',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎖️ 集结先遣军</div>
                        <div class="node-detail">为围攻魔王做准备</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📋 前置条件</div>
                        <div class="node-detail">名声 ≥ 1500<br>在勇者工会触发引导</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 招募费用</div>
                        <div class="node-detail">1000金 + 6锻材 = 1个普通勇士<br>5000金 + 6稀有锻材 = 1个精英勇士</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 招募成功</div>
                        <div class="node-detail">勇士数量增加<br>为围攻魔王储备力量</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">🎯 最终目标</div>
                        <div class="node-detail">足够勇士 → 可围攻魔王<br>减少挑战难度</div>
                    </div>
                </div>
            `,
            details: [
                '触发条件：名声 ≥ 1500',
                '引导任务：在勇者工会接取',
                '招募费用：',
                '  普通勇士：1000金 + 6锻材',
                '  精英勇士：5000金 + 6稀有锻材',
                '招募上限：根据名声计算（名声/100×15）',
                '用途：围攻魔王顶时增加成功率',
                '⚠️ 这是挑战魔王的前置准备'
            ]
        }
    ]
};


