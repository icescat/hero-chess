/**
 * 竞技场事件详细数据
 * 位置：#15
 */

const ARENA_EVENTS = {
    id: 'arena',
    title: '🏟️ 竞技场',
    description: '参加排名赛，从F级打到SSS级，赢取丰厚奖金',
    location: '#15',
    events: [
        {
            name: '参加比赛',
            probability: '玩家选择',
            trigger: '有足够耐力时可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">⚔️ 参加排名赛</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">⚡ 消耗40%耐力</div>
                        <div class="node-detail">战斗消耗</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎯 匹配对手</div>
                        <div class="node-detail">与同排名对手战斗<br>等级 = 玩家等级 ± 2</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🏆 胜利</div>
                                <div class="node-detail">连胜+1<br>获得奖金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">连败+1<br>死亡复活</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">⬆️ 连胜3次</div>
                                <div class="node-detail">排名提升一级</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">⬇️ 连败3次</div>
                                <div class="node-detail">排名降低一级</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '消耗：40%耐力',
                '对手：与当前排名相同的NPC',
                '胜利：获得奖金 + 连胜计数+1',
                '失败：死亡（需复活）+ 连败计数+1',
                '晋级：连胜3次 → 排名提升一级',
                '降级：连败3次 → 排名降低一级',
                '⚠️ 战败会死亡，有风险'
            ]
        },
        {
            name: '观看比赛',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👀 观看比赛</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📺 安全观战</div>
                        <div class="node-detail">不消耗耐力<br>无风险</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">⭐ 获得少量经验</div>
                        <div class="node-detail">经验 = 等级 × 3</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：无',
                '获得：等级×3经验',
                '特点：安全无风险',
                '建议：实力不足时选择观战',
                '💡 前期练级的安全途径'
            ]
        },
        {
            name: '排名系统',
            probability: '系统机制',
            trigger: '通过连胜/连败自动调整',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🏆 排名系统</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📊 9个等级</div>
                        <div class="node-detail">F → E → D → C → B → A → S → SS → SSS</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">⬆️ 晋级</div>
                                <div class="node-detail">连胜3次<br>对手变强<br>奖金提升</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">⬇️ 降级</div>
                                <div class="node-detail">连败3次<br>对手变弱<br>奖金降低</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">💰 奖金表</div>
                        <div class="node-detail">F:50 E:100 D:200 C:400<br>B:800 A:1600 S:3200<br>SS:6400 SSS:12800</div>
                    </div>
                </div>
            `,
            details: [
                '初始排名：F级',
                '最高排名：SSS级',
                '晋级规则：连胜3次',
                '降级规则：连败3次',
                '奖金倍增：每升一级奖金×2',
                'F级：50金',
                'E级：100金',
                'D级：200金',
                'C级：400金',
                'B级：800金',
                'A级：1600金',
                'S级：3200金',
                'SS级：6400金',
                'SSS级：12800金',
                '⚠️ 对手强度随排名提升'
            ]
        },
        {
            name: '兽人斗士挑战',
            probability: '10%概率',
            trigger: '到达竞技场时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🦾 兽人斗士</div>
                        <div class="node-detail">嚣张挑衅</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 强制战斗</div>
                        <div class="node-detail">劲敌级敌人<br>等级 = 玩家等级<br>属性×1.2</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">⚔️ 掉落5级装备<br>⭐ 名声+（等级/30×4）</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">❌ 失败</div>
                                <div class="node-detail">死亡，传送回城复活</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">⏱️ 超时</div>
                                <div class="node-detail">平局，约定日后再战</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：10%概率，到达竞技场时判定',
                '敌人：兽人斗士（劲敌级）',
                '等级：与玩家相同',
                '属性：全属性×1.2（比同级敌人强20%）',
                '胜利奖励：',
                '  ⚔️ 5级装备（高级装备）',
                '  ⭐ 名声+（等级/30×4）',
                '失败：死亡，传送回最近城镇复活',
                '超时：平局，无奖励无惩罚',
                '⚠️ 有一定风险，建议状态良好时接战',
                '💡 5级装备非常珍贵，值得一战'
            ]
        },
        {
            name: '日光马戏团',
            probability: '20%概率（白天）',
            trigger: '到达竞技场白天时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎪 日光马戏团</div>
                        <div class="node-detail">今日无赛事<br>改为马戏团演出</div>
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
                '效果：竞技场停办，改为马戏团演出',
                '条件：金钱≥5000才能购买道具',
                '可购买道具（随机1件）：',
                '  ① 灵魂石（遗物，3000金）- 战斗死亡时满血复活',
                '  ② 灯塔（Buff）- 传送功能增强',
                '  ③ 金色染料（Buff）- 声望获取+50%',
                '  ④ 水上飘（Buff）- 水上行走',
                '  ⑤ 香水（Buff）- 随从好感获取翻倍',
                '  ⑥ 胡萝卜（Buff）- 马匹速度提升',
                '💡 与房屋的马戏团事件相同',
                '💡 灵魂石极其珍贵，遇到必买'
            ]
        },
        {
            name: '策略建议',
            probability: '游戏机制',
            trigger: '玩家自行掌握',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎯 AI策略</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">🐣 前期（1-15级）</div>
                                <div class="node-detail">观战为主<br>获得安全经验</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">⚔️ 中期（16-25级）</div>
                                <div class="node-detail">谨慎参战<br>状态好时打</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node highlight">
                                <div class="node-content">💪 后期（26级+）</div>
                                <div class="node-detail">积极参战<br>冲击高排名</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '前期（1-15级）：观战为主，安全获得经验',
                '中期（16-25级）：谨慎参战，状态好时打几场',
                '后期（26级+）：积极参战，冲击高排名赚大钱',
                '风险控制：',
                '  ✅ 生命和耐力充足时参战',
                '  ✅ 有战斗Buff时参战',
                '  ❌ 状态不佳时观战',
                '  ❌ 连败2次后暂停',
                '💡 SSS级奖金12800，后期主要收入来源之一'
            ]
        }
    ]
};


