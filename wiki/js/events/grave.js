/**
 * 墓地事件详细数据
 * 位置：#9和#30
 */

const GRAVE_EVENTS = {
    id: 'grave',
    title: '⚰️ 墓地',
    description: '高风险高回报，可能遇到宝藏或强大亡灵',
    location: '#9和#30（两个墓地）',
    events: [
        {
            name: '祭拜先祖',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🙏 祭拜先祖</div>
                        <div class="node-detail">在墓地拜祭</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚠️ 夜晚有风险</div>
                        <div class="node-detail">10%概率遇吸血鬼</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">普通</div>
                            <div class="tree-node success">
                                <div class="node-content">✨ 获得祝福</div>
                                <div class="node-detail">下一场战斗99%胜率<br>随从好感+4（香水+8）</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">30次</div>
                            <div class="tree-node highlight">
                                <div class="node-content">🎁 特殊奖励</div>
                                <div class="node-detail">累计30次祭拜<br>获得随机遗物</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '消耗：无',
                '普通效果：',
                '  ① 下一场战斗99%必胜（几乎必胜Buff）',
                '  ② 随从亲密度+4（有香水Buff时+8）',
                '特殊奖励：',
                '  每累计祭拜30次，获得1个随机遗物',
                '⚠️ 夜晚10%概率触发吸血鬼Boss战',
                '💡 推荐战斗前来祭拜获得必胜Buff'
            ]
        },
        {
            name: '吸血鬼Boss战',
            probability: '10%概率（夜晚）',
            trigger: '夜晚祭拜时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🦇 吸血鬼袭击</div>
                        <div class="node-detail">夜晚墓地的恐怖</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制Boss战</div>
                        <div class="node-detail">精英级吸血鬼<br>等级 = max(10, 玩家等级+5)</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">生命+300<br>"吸食灰烬"</div>
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
                '触发：10%概率，仅夜晚祭拜时',
                '敌人：吸血鬼（精英级Boss）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利奖励：生命永久上限+300',
                '失败：死亡，传送回最近城镇复活',
                '⚠️ 建议白天去墓地避免遇到',
                '💡 或者带足实力夜晚来挑战'
            ]
        },
        {
            name: '挖掘墓地',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⚰️ 挖掘墓地</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">⚡ 消耗30%耐力</div>
                        <div class="node-detail">挖掘消耗</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎲 随机判定</div>
                        <div class="node-detail">运气决定收获</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">30%</div>
                            <div class="tree-node success">
                                <div class="node-content">💰 发现宝藏</div>
                                <div class="node-detail">500-2000金<br>或材料/装备</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">20%</div>
                            <div class="tree-node fail">
                                <div class="node-content">👻 亡灵战斗</div>
                                <div class="node-detail">强制战斗<br>精英级敌人</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">30%</div>
                            <div class="tree-node info">
                                <div class="node-content">🤢 感染疾病</div>
                                <div class="node-detail">获得负面Buff<br>需治疗</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">20%</div>
                            <div class="tree-node info">
                                <div class="node-content">❌ 空墓</div>
                                <div class="node-detail">什么都没有</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '消耗：30%耐力',
                '概率分布：',
                '  30% - 发现宝藏（500-2000金或材料/装备）',
                '  20% - 遇到亡灵（强制战斗，精英级）',
                '  30% - 感染疾病（负面Buff）',
                '  20% - 什么都没有',
                '⚠️ 高风险高回报',
                '⚠️ 建议有治疗手段再来'
            ]
        },
        {
            name: '亡灵战斗',
            probability: '20%触发',
            trigger: '挖掘墓地时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👻 亡灵苏醒</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制战斗</div>
                        <div class="node-detail">骷髅战士、僵尸等<br>精英级敌人</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">额外奖励<br>材料+经验</div>
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
                '敌人：骷髅战士、僵尸、幽灵等',
                '等级：玩家等级+2左右',
                '强度：精英级（比普通敌人强）',
                '胜利：材料+经验+金钱',
                '失败：死亡复活',
                '⚠️ 有一定风险'
            ]
        },
        {
            name: '疾病感染',
            probability: '30%触发',
            trigger: '挖掘墓地时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🤢 感染疾病</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node fail">
                        <div class="node-content">💊 获得负面Buff</div>
                        <div class="node-detail">攻防降低<br>持续若干回合</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🏥 治疗方法</div>
                        <div class="node-detail">城镇治疗<br>温泉休息<br>自然恢复</div>
                    </div>
                </div>
            `,
            details: [
                '效果：攻击和防御降低20%',
                '持续：3-5回合',
                '治疗方法：',
                '  🏥 城镇医馆治疗（花费金钱）',
                '  ♨️ 温泉泡澡（免费清除）',
                '  ⏰ 自然恢复（等待若干回合）',
                '⚠️ 疾病期间战斗能力大减'
            ]
        },
        {
            name: '宝藏发现',
            probability: '30%触发',
            trigger: '挖掘墓地时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💎 发现宝藏</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">50%</div>
                            <div class="tree-node success">
                                <div class="node-content">💰 金钱</div>
                                <div class="node-detail">500-2000金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">30%</div>
                            <div class="tree-node success">
                                <div class="node-content">📦 材料</div>
                                <div class="node-detail">锻材或稀有锻材</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">20%</div>
                            <div class="tree-node highlight">
                                <div class="node-content">⚔️ 装备</div>
                                <div class="node-detail">随机装备<br>可能是高级</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '金钱（50%）：500-2000金',
                '材料（30%）：5-10锻材或2-5稀有锻材',
                '装备（20%）：随机装备，可能高级',
                '💡 运气好能赚大钱'
            ]
        },
        {
            name: '死灵法师事件',
            probability: '极低概率触发',
            trigger: '墓地随机',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🧙 遇到死灵法师</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ Boss战</div>
                        <div class="node-detail">传说级敌人<br>极其强大</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">🏆 胜利</div>
                                <div class="node-detail">学习死灵魔法天赋<br>或获得稀有遗物</div>
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
                '触发：极低概率',
                '敌人：死灵法师（传说Boss）',
                '胜利：稀有天赋或遗物',
                '风险：非常强大，战败会死亡',
                '⚠️ 建议满级满装再挑战'
            ]
        }
    ]
};


