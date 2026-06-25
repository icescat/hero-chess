/**
 * 勇者工会事件详细数据
 * 位置：#5和#24
 * 
 * V1.0.6: 训练需要支付费用（等级×50金）
 */

const GUILD_EVENTS = {
    id: 'guild',
    title: '🛡️ 勇者工会',
    description: '学习天赋、训练提升、领取遗物、完成委托任务',
    location: '#5和#24',
    events: [
        {
            name: '学习天赋',
            probability: '玩家选择',
            trigger: '每5级可学1个天赋',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📚 选择学习天赋</div>
                        <div class="node-detail">消耗金钱</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📋 天赋列表</div>
                        <div class="node-detail">共21种天赋可学<br>分为：战斗、生存、特殊三类</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 一般天赋</div>
                                <div class="node-detail">1000金</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node cost">
                                <div class="node-content">💰 高级天赋</div>
                                <div class="node-detail">5000金</div>
                            </div>
                        </div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✨ 学习成功</div>
                        <div class="node-detail">永久获得该天赋<br>天赋效果立即生效</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：1000-5000金（根据天赋不同）',
                '解锁：每5级可解锁1个天赋',
                '天赋分类：',
                '  ① 战斗类：双持、嗜血、致命打击等',
                '  ② 生存类：厚皮、耐力恢复、负重提升等',
                '  ③ 特殊类：炼金术、嘴炮、贪婪等',
                '⚠️ 天赋一旦学习无法重置',
                '💡 建议优先学习核心天赋'
            ]
        },
        {
            name: '勇者修行',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">💪 在工会训练</div>
                        <div class="node-detail">需要支付训练费用</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">💰 费用：等级×50金</div>
                        <div class="node-detail">1级=50金，50级=2500金</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node cost">
                        <div class="node-content">⚡ 消耗20%耐力</div>
                        <div class="node-detail">体能训练</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">🎲 随机训练类型</div>
                        <div class="node-detail">夜晚更容易触发属性训练</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">⚔️ 剑技训练</div>
                                <div class="node-detail">攻击+10/20</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🛡️ 抗击打训练</div>
                                <div class="node-detail">防御+5/10</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">💚 冥想训练</div>
                                <div class="node-detail">生命+100</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🎒 负重训练</div>
                                <div class="node-detail">负重+10/20</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">🎯 站桩训练</div>
                                <div class="node-detail">获得经验</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '💰 费用：等级×50金（1级50金，50级2500金）',
                '⚡ 消耗：20%最大耐力',
                '训练类型（随机）：',
                '  ① 剑技训练：攻击+10（妻子帮助+20）',
                '  ② 抗击打训练：防御+5（妻子帮助+10）',
                '  ③ 冥想训练：生命+100',
                '  ④ 负重训练：负重+10（妻子帮助+20）',
                '  ⑤ 站桩训练：获得等级×5经验（最高×6倍）',
                '💡 夜晚更容易触发属性训练（①②③④）',
                '💡 有妻子帮助时效果翻倍'
            ]
        },
        {
            name: '领取遗物',
            probability: '满足条件时自动',
            trigger: '有待领取遗物时',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🎁 领取遗物奖励</div>
                        <div class="node-detail">勇者岗位突出贡献</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🏆 名声+30</div>
                        <div class="node-detail">嘉奖勇者</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">🎲 随机遗物</div>
                        <div class="node-detail">从18种遗物中随机获得1个</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">⚡ 永久效果</div>
                        <div class="node-detail">遗物效果永久生效<br>可叠加持有多个</div>
                    </div>
                </div>
            `,
            details: [
                '条件：有待领取遗物时自动触发',
                '遗物来源：击杀特定Boss、完成特定任务',
                '遗物种类：18种，随机获得',
                '重复：可能获得重复遗物（效果叠加）',
                '价值极高：',
                '  灵魂石：死亡时满血复活（一次性）',
                '  龙翔化石：永久+50生命',
                '  暗黑之书：战斗暴击率+10%',
                '⚠️ 无法选择遗物类型，完全随机'
            ]
        },
        {
            name: '查阅勇者事迹',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">📖 查阅日志</div>
                        <div class="node-detail">记录冒险经历</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">📜 冒险日志</div>
                        <div class="node-detail">记录重要事件<br>战斗、任务、成就等</div>
                    </div>
                </div>
            `,
            details: [
                '功能：查看冒险日志',
                '记录：重要事件、战斗记录、任务完成等',
                '用途：回顾冒险历程',
                '💡 日志会自动记录重要事件'
            ]
        }
    ]
};


