/**
 * 马场事件详细数据
 * 位置：#23
 */

const STABLE_EVENTS = {
    id: 'stable',
    title: '🐴 马场',
    description: '购买、训练、配种坐骑，参加赛马比赛，可能触发特殊Boss战',
    location: '#23',
    events: [
        {
            name: '购买坐骑',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🐴 选择购买坐骑</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📋 马匹列表</div>
                        <div class="node-detail">根据等级显示可购买马匹</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 普通马</div>
                                <div class="node-detail">1000-2000金<br>-1耐力消耗</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 优秀马</div>
                                <div class="node-detail">3000-5000金<br>-2耐力消耗</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 完美马</div>
                                <div class="node-detail">8000-15000金<br>-3耐力消耗</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 购买成功</div>
                        <div class="node-detail">坐骑装备，被动减少移动耐力消耗</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">🎁 特殊马匹</div>
                        <div class="node-detail">幽冥战马：码头完成后可购买<br>-4耐力消耗 + 水上行走</div>
                    </div>
                </div>
            `,
            details: [
                '价格：根据马匹等级，费用=等级²×1000金',
                '马匹属性加成（被动生效）：',
                '  普通的马：攻击+30 负重+50 耐力-1',
                '  优秀的马：攻击+50 负重+100 耐力-1',
                '  出众的马：攻击+70 负重+150 耐力-2',
                '  卓越的马：攻击+90 负重+200 耐力-2',
                '  完美的马：攻击+110 负重+250 耐力-3',
                '  幽冥战马：攻击+210 负重+350 耐力-4 + 水上行走',
                '成长系统：任务/训练可提升成长度',
                '⚠️ 只能装备1匹坐骑'
            ]
        },
        {
            name: '马术训练',
            probability: '玩家选择',
            trigger: '有坐骑且未达终代时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏋️ 马术训练</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 费用：1000金</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">⭐ 成长度+10~20</div>
                        <div class="node-detail">100%成功<br>成长度满100可改良马种</div>
                    </div>
                </div>
            `,
            details: [
                '费用：1000金',
                '效果：成长度+10~20（100%成功）',
                '成长度满100后可花钱改良马种',
                '改良后马匹升级，属性大幅提升',
                '⚠️ 完美马终代无法训练'
            ]
        },
        {
            name: '赛马大会',
            probability: '玩家选择',
            trigger: '有坐骑时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏇 参加赛马</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎲 比赛判定</div>
                        <div class="node-detail">根据马匹等级<br>等级越高胜率越高</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🥇 第1名</div>
                                <div class="node-detail">奖金5000金<br>成长度提升</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">🥈🥉 第2/3名</div>
                                <div class="node-detail">奖金1000-2000金<br>成长度提升</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 未入前3</div>
                                <div class="node-detail">无奖金</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '消耗：无',
                '第1名：5000金 + 成长度提升',
                '第2名：2000金 + 成长度提升',
                '第3名：1000金 + 成长度提升',
                '胜率：马匹等级越高胜率越高',
                '💡 赚钱和培养马匹两不误'
            ]
        },
        {
            name: '盗马贼事件',
            probability: '20%概率（夜晚）',
            trigger: '到达马场夜晚时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🦹 遇到盗马贼</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 战斗</div>
                        <div class="node-detail">盗马贼（精英级）</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">可能获得高级马匹</div>
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
                '触发：20%概率，仅在夜晚触发',
                '敌人：盗马贼（精英级）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利：40%概率获赠高级马匹',
                '失败：死亡，传送回最近城镇复活'
            ]
        },
        {
            name: '独眼巨人Boss战',
            probability: '10%概率（白天）',
            trigger: '到达马场白天时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👁️ 独眼巨人出现</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ Boss战</div>
                        <div class="node-detail">传说级敌人<br>极其强大</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🏆 胜利</div>
                                <div class="node-detail">⚡ 永久攻击+30</div>
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
                '触发：10%概率，仅在白天触发',
                '敌人：独眼巨人（精英级Boss）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利：永久攻击+30',
                '失败：死亡，传送回最近城镇复活',
                '⚠️ 建议至少15级以上再挑战'
            ]
        },
        {
            name: '改良马种',
            probability: '玩家选择',
            trigger: '坐骑成长度满100时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⭐ 改良马种</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 改良费用</div>
                        <div class="node-detail">费用 = 马匹等级² × 2000金</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 马匹升级</div>
                        <div class="node-detail">攻击+20 负重+50<br>成长度重置为0</div>
                    </div>
                </div>
            `,
            details: [
                '条件：坐骑成长度达到100',
                '费用：马匹等级² × 2000金',
                '效果：马匹升级到下一代',
                '属性提升：攻击+20，负重+50',
                '成长度重置为0，可继续培养',
                '⚠️ 完美马终代无法再升级'
            ]
        }
    ]
};


