/**
 * 村庄事件详细数据
 * 位置：#11和#30
 */

const VILLAGE_EVENTS = {
    id: 'village',
    title: '🏘️ 村庄',
    description: '小型聚落，可以休息、捐赠材料、帮忙干活、喝酒和求婚',
    location: '#11（第1座村庄）和#30（第2座村庄）',
    events: [
        {
            name: '住宿',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💤 选择住宿</div>
                        <div class="node-detail">在村庄休息</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">声望满</div>
                            <div class="tree-node success">
                                <div class="node-content">✅ 免费住宿</div>
                                <div class="node-detail">完全恢复生命和耐力</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">声望未满</div>
                            <div class="tree-node cost">
                                <div class="node-content">💰 20金</div>
                                <div class="node-detail">完全恢复生命和耐力</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '花费：声望满免费，否则20金',
                '效果：完全恢复生命和耐力到最大值',
                '⚠️ 与城镇住宿规则相同',
                '⚠️ 刚复活时状态已满，无需住宿'
            ]
        },
        {
            name: '捐赠材料',
            probability: '玩家选择',
            trigger: '有材料时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📦 选择捐赠</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 普通锻材</div>
                                <div class="node-detail">50个 → +300声望</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💎 稀有锻材</div>
                                <div class="node-detail">10个 → +300声望</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">⭐ 声望提升</div>
                        <div class="node-detail">+300声望<br>可能升级声望等级</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🏘️ 村庄好感+10</div>
                        <div class="node-detail">提升与该村庄的关系</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：50个普通锻材 或 10个稀有锻材',
                '获得：+300声望 + 村庄好感+10',
                '用途：快速提升声望等级',
                '⚠️ 银行材料也会自动使用',
                '✅ 刚复活后仍可捐赠（不受虚弱限制）'
            ]
        },
        {
            name: '帮忙干活',
            probability: '玩家选择',
            trigger: '白天到达时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💪 选择帮忙</div>
                        <div class="node-detail">为村民干活</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">33%</div>
                            <div class="tree-node success">
                                <div class="node-content">💰 获得金钱</div>
                                <div class="node-detail">100-300金<br>村庄好感+5</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">33%</div>
                            <div class="tree-node success">
                                <div class="node-content">📦 获得材料</div>
                                <div class="node-detail">5-10锻材<br>村庄好感+5</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">33%</div>
                            <div class="tree-node success">
                                <div class="node-content">❤️ 随从好感</div>
                                <div class="node-detail">随从亲密度+10<br>村庄好感+5</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚡ 消耗30%耐力</div>
                        <div class="node-detail">辛苦劳作</div>
                    </div>
                </div>
            `,
            details: [
                '触发：只能在白天帮忙',
                '消耗：30%当前耐力',
                '奖励（33%各）：',
                '  ① 金钱：100-300金 + 村庄好感+5',
                '  ② 材料：5-10锻材 + 村庄好感+5',
                '  ③ 随从好感：亲密度+10 + 村庄好感+5',
                '⚠️ 刚复活时无法帮忙（太虚弱）'
            ]
        },
        {
            name: '喝酒',
            probability: '玩家选择',
            trigger: '夜晚到达时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🍺 酒馆喝酒</div>
                        <div class="node-detail">100金/次</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="probability-badge">50%</div>
                            <div class="tree-node info">
                                <div class="node-content">💬 毫无所获</div>
                                <div class="node-detail">普通闲聊</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">20%</div>
                            <div class="tree-node fail">
                                <div class="node-content">🍻 喝醉</div>
                                <div class="node-detail">耐力-20%</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">10%</div>
                            <div class="tree-node success">
                                <div class="node-content">🎲 赌博</div>
                                <div class="node-detail">赢100-1000金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">10%</div>
                            <div class="tree-node success">
                                <div class="node-content">💕 春宵</div>
                                <div class="node-detail">状态全满</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="probability-badge">10%</div>
                            <div class="tree-node highlight">
                                <div class="node-content">📰 线索</div>
                                <div class="node-detail">Boss消息</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '花费：100金/次',
                '概率分布：',
                '  ① 50% 毫无所获 - 普通聊天',
                '  ② 20% 喝醉被丢出 - 耐力-20%',
                '  ③ 10% 赌博赢钱 - 获得100-1000金',
                '  ④ 10% 欢度春宵 - 生命耐力全满',
                '  ⑤ 10% 获得线索 - 随机Boss线索',
                '可打听的线索（4种）：',
                '  • 乌鸦王（营地）- 营地质量提升',
                '  • 盗马贼（马场夜晚）- 可能获得高级马匹',
                '  • 独眼巨人（马场白天）- 永久攻击+30',
                '  • 铁匠大师（温泉）- 免费强化装备+1',
                '线索机制：有效期10回合，持有时到达对应格子必定触发',
                '⚠️ 刚复活时无法喝酒'
            ]
        },
        {
            name: '求婚',
            probability: '触发条件满足时自动',
            trigger: '随从亲密度100 + 村庄声望满 + 无妻子',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💍 求婚条件满足</div>
                        <div class="node-detail">随从亲密度100<br>村庄声望满<br>当前无妻子</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">💖 随从主动表白</div>
                        <div class="node-detail">"我愿意成为你的妻子"</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 接受求婚</div>
                                <div class="node-detail">随从变为妻子</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 拒绝求婚</div>
                                <div class="node-detail">随从离开队伍</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">👰 婚后效果</div>
                        <div class="node-detail">✨ 妻子特殊技能解锁<br>💕 可带妻子回家（需建房）<br>🎁 妻子协助炼金/训练等</div>
                    </div>
                </div>
            `,
            details: [
                '条件：',
                '  ① 随从亲密度达到100',
                '  ② 村庄声望满（好感度满）',
                '  ③ 当前没有妻子',
                '  ④ 在村庄时自动触发',
                '效果：',
                '  ✅ 接受：随从成为妻子，获得特殊技能',
                '  ❌ 拒绝：随从离开队伍',
                '妻子技能：根据职业不同有不同效果',
                '⚠️ 一次只能有一个妻子'
            ]
        },
        {
            name: '村庄被袭',
            probability: '低概率随机事件',
            trigger: '特定条件下触发',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⚔️ 村庄遭到怪物袭击</div>
                        <div class="node-detail">村庄暂时关闭</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node fail">
                        <div class="node-content">🚫 无法进入</div>
                        <div class="node-detail">"这里不久前刚遭遇过怪物侵袭<br>暂时不欢迎外人入内"</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⏰ 持续时间</div>
                        <div class="node-detail">数个回合后恢复正常</div>
                    </div>
                </div>
            `,
            details: [
                '触发：随机事件，概率较低',
                '效果：村庄暂时关闭，无法使用任何服务',
                '持续：数个回合后自动恢复',
                '⚠️ 无法提前解除'
            ]
        }
    ]
};


