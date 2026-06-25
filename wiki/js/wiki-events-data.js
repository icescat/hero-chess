/**
 * 勇者棋 Wiki - 格子事件详细数据
 * 独立文件，方便维护
 */

const CELL_TYPES_DATA = [
    { 
        id: 'town', 
        icon: '🏰', 
        name: '城镇', 
        desc: '主城，提供各种服务',
        count: 2 
    },
    { 
        id: 'village', 
        icon: '🏘️', 
        name: '村庄', 
        desc: '小型聚落，休息和做任务',
        count: 2 
    },
    { 
        id: 'guild', 
        icon: '🛡️', 
        name: '勇者工会', 
        desc: '学习天赋和领取奖励',
        count: 1 
    },
    { 
        id: 'camp', 
        icon: '⛺', 
        name: '营地', 
        desc: '雇佣和训练随从',
        count: 1 
    },
    { 
        id: 'stable', 
        icon: '🐴', 
        name: '马场', 
        desc: '购买和培育坐骑',
        count: 1 
    },
    { 
        id: 'arena', 
        icon: '🏟️', 
        name: '竞技场', 
        desc: '参加排名赛',
        count: 1 
    },
    { 
        id: 'dungeon', 
        icon: '🚪', 
        name: '副本', 
        desc: '探索地下城，刷材料',
        count: 2 
    },
    { 
        id: 'dock', 
        icon: '⚓', 
        name: '码头', 
        desc: '建设船只，出海探险',
        count: 2 
    },
    { 
        id: 'house', 
        icon: '🏠', 
        name: '房屋', 
        desc: '建设家园，获得收益',
        count: 2 
    },
    { 
        id: 'grave', 
        icon: '⚰️', 
        name: '墓地', 
        desc: '神社，可能遇到吸血鬼',
        count: 1 
    },
    { 
        id: 'spring', 
        icon: '♨️', 
        name: '温泉', 
        desc: '恢复状态，清除减益',
        count: 1 
    },
    { 
        id: 'fairyland', 
        icon: '🏝️', 
        name: '仙人岛', 
        desc: '6种随机事件，需船只',
        count: 1 
    },
    { 
        id: 'plain', 
        icon: '🌾', 
        name: '平原', 
        desc: '野外格子，随机事件',
        count: 6 
    },
    { 
        id: 'forest', 
        icon: '🌲', 
        name: '林地', 
        desc: '野外格子，可能救助珍兽',
        count: 6 
    },
    { 
        id: 'beach', 
        icon: '🏖️', 
        name: '海滩', 
        desc: '野外格子，可能遇到强盗',
        count: 6 
    }
];

// 获取格子详细数据（事件+概率树）
function getCellDetailData(cellId) {
    const data = {
        town: {
            title: '🏰 城镇',
            description: '棋盘上的主城，提供住宿、锻造、存储、任务、修行、喝酒等各种服务',
            location: '0号格和19号格',
            events: [
                {
                    name: '住宿',
                    probability: '玩家选择',
                    trigger: '每次到达都可选择',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">💤 选择住宿</div>
                                <div class="node-arrow">↓</div>
                            </div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">声望满</div>
                                    <div class="tree-node success">
                                        <div class="node-content">✅ 免费</div>
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
                        '建议：声望满后住宿完全免费，非常划算'
                    ]
                },
                {
                    name: '锻造',
                    probability: '玩家选择',
                    trigger: '有材料时可选择',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">⚒️ 选择锻造</div>
                                <div class="node-arrow">↓</div>
                            </div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">+1强化</div>
                                    <div class="tree-node info">
                                        <div class="node-content">📊 80%成功率</div>
                                        <div class="node-detail">5锻材，1稀有锻材</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">+2强化</div>
                                    <div class="tree-node info">
                                        <div class="node-content">📊 70%成功率</div>
                                        <div class="node-detail">10锻材，2稀有锻材</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">+3强化</div>
                                    <div class="tree-node info">
                                        <div class="node-content">📊 60%成功率</div>
                                        <div class="node-detail">15锻材，3稀有锻材</div>
                                    </div>
                                </div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="tree-node success">
                                        <div class="node-content">✅ 成功</div>
                                        <div class="node-detail">装备强化+1</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="tree-node fail">
                                        <div class="node-content">❌ 失败</div>
                                        <div class="node-detail">材料消耗，装备不变</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                    details: [
                        '强化武器/护甲：200金，100%成功，最高+9',
                        '锻造新武器/护甲：消耗锻材+稀有锻材',
                        '成功率：随装备等级递减',
                        '最高强化：+9',
                        '⚠️ 满级选项不显示'
                    ]
                },
                {
                    name: '升级背包',
                    probability: '玩家选择',
                    trigger: '背包未满级时可选择',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">🎒 升级背包</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node info">
                                <div class="node-content">📦 背包等级</div>
                                <div class="node-detail">
                                    Lv1 粗布包 +50负重<br>
                                    Lv2 皮革背包 +100负重<br>
                                    Lv3 旅行背囊 +200负重<br>
                                    Lv4 冒险者包 +350负重<br>
                                    Lv5 魔法行囊 +450负重<br>
                                    Lv6 次元旅袋 +600负重
                                </div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node cost">
                                <div class="node-content">💰 升级费用</div>
                                <div class="node-detail">金钱 + 普通锻材</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">✅ 升级成功</div>
                                <div class="node-detail">负重上限提升</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '背包系统（V1.0.6新增）：',
                        '  Lv1 粗布包：+50负重（初始）',
                        '  Lv2 皮革背包：+100负重（5000金+5材）',
                        '  Lv3 旅行背囊：+200负重（15000金+10材）',
                        '  Lv4 冒险者包：+350负重（40000金+20材）',
                        '  Lv5 魔法行囊：+450负重（100000金+35材）',
                        '  Lv6 次元旅袋：+600负重（250000金+50材）',
                        '基础负重50 + 背包加成 + 坐骑加成 = 总负重上限',
                        '⚠️ 背包满级后选项不显示'
                    ]
                },
                {
                    name: '存储材料',
                    probability: '玩家选择',
                    trigger: '有材料时可选择',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">📦 材料银行</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="tree-node cost">
                                        <div class="node-content">💰 存入</div>
                                        <div class="node-detail">10金/个（普通/稀有相同）</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="tree-node info">
                                        <div class="node-content">💰 取出</div>
                                        <div class="node-detail">普通50金，稀有200金回收</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                    details: [
                        '存入：10金/个（普通锻材和稀有锻材价格相同）',
                        '取出：普通锻材50金，稀有锻材200金回收',
                        '用途：减轻负重，后期可卖掉换金钱',
                        '⚠️ 锻造时会自动使用银行材料'
                    ]
                },
                {
                    name: '接受任务',
                    probability: '玩家选择',
                    trigger: '白天到达，没有任务时',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">📜 接受委托任务</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">50%</div>
                                    <div class="tree-node info">
                                        <div class="node-content">📦 送信任务</div>
                                        <div class="node-detail">到指定村庄送信</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">50%</div>
                                    <div class="tree-node info">
                                        <div class="node-content">🛡️ 护送任务</div>
                                        <div class="node-detail">保护NPC到目标地</div>
                                    </div>
                                </div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">🎁 完成奖励</div>
                                <div class="node-detail">经验+金钱+声望<br>每完成10个可领取1个遗物</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '触发：白天到达城镇，且没有进行中的任务',
                        '类型：送信任务（50%）或护送任务（50%）',
                        '奖励：经验、金钱、声望',
                        '遗物：每完成10个委托任务，可在勇者工会领取1个随机遗物',
                        '⚠️ 死亡后"永不死亡"任务失败',
                        '⚠️ 刚复活时无法接任务（太虚弱）'
                    ]
                },
                {
                    name: '修行',
                    probability: '玩家选择',
                    trigger: '每次到达都可选择',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">🧘 修行</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node cost">
                                <div class="node-content">💰 花费：等级×100金</div>
                                <div class="node-detail">消耗：50%耐力</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">⭐ 获得：等级×10经验</div>
                                <div class="node-detail">快速提升等级的方式</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '花费：等级×100金 + 50%耐力',
                        '获得：等级×10经验',
                        '效率：后期有钱可以快速升级',
                        '建议：优先完成任务和战斗，有闲钱再修行'
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
                        '可打听：乌鸦王、盗马贼、独眼巨人、铁匠大师',
                        '线索有效期10回合，持有时到达对应格子必触发'
                    ]
                }
            ]
        },
        // 更多格子数据将在后续补充...
        fairyland: {
            title: '🏝️ 仙人岛',
            description: '神秘的仙境岛屿，每次到达触发6种随机事件之一，需要从码头乘船到达',
            location: '通过码头（#8或#27）乘船到达',
            events: [
                {
                    name: '仙女赠装',
                    probability: '16.7%（6选1）× 40%（触发）= 6.7%',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">🏝️ 到达仙人岛</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node info">
                                <div class="node-content">🎲 随机事件（1/6）</div>
                                <div class="node-detail">6种事件等概率</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node highlight">
                                <div class="node-content">🧚‍♀️ 抽到仙女事件</div>
                                <div class="node-detail">16.7%概率</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">60%</div>
                                    <div class="tree-node fail">
                                        <div class="node-content">❌ 姿势不对</div>
                                        <div class="node-detail">"原来是你掉落装备的姿势不对，呜呼"<br>什么都不给</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">40%</div>
                                    <div class="tree-node success">
                                        <div class="node-content">✅ 触发成功</div>
                                        <div class="node-detail">装备掉落湖中，仙女出现</div>
                                    </div>
                                </div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">60%</div>
                                    <div class="tree-node info">
                                        <div class="node-content">⚔️ 武器</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">40%</div>
                                    <div class="tree-node info">
                                        <div class="node-content">🛡️ 护甲</div>
                                    </div>
                                </div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="probability-badge">50%</div>
                                    <div class="tree-node success">
                                        <div class="node-content">🎁 披外套</div>
                                        <div class="node-detail">"你连忙将自己外套给她披上"<br>⭐ 赠送下一套装备<br>（+1→+2，+2→+3...）</div>
                                    </div>
                                </div>
                                <div class="tree-branch">
                                    <div class="probability-badge">50%</div>
                                    <div class="tree-node success">
                                        <div class="node-content">✨ 诚实选择</div>
                                        <div class="node-detail">"你诚实选择旧装备"<br>⚡ 装备强化+1<br>（最高+9）</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                    details: [
                        '总体概率：16.7%抽中 × 40%触发 = 6.7%',
                        '姿势不对：60%概率什么都不给',
                        '触发成功后：60%影响武器，40%影响护甲',
                        '两种结果（各50%）：',
                        '  ① 披外套：赠送下一套装备（如青铜+1→白银+2）',
                        '  ② 诚实选择：当前装备强化+1（最高+9）',
                        '⚠️ 装备已是最高套装时无法再升级套装',
                        '💡 期望：40%成功率，20%获得新套装，20%强化+1'
                    ]
                },
                {
                    name: '高人传功',
                    probability: '16.7%（6选1）',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">👴 遇到高人</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">✨ 传功</div>
                                <div class="node-detail">获得大量经验：等级×40</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '概率：16.7%（6选1）',
                        '效果：直接获得 等级×40 经验',
                        '收益：非常高，相当于4次修行',
                        '建议：等级越高收益越大'
                    ]
                },
                {
                    name: '学习嘴炮术',
                    probability: '16.7%（6选1）',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">💬 学习嘴炮术</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">🎯 解锁天赋</div>
                                <div class="node-detail">获得"嘴炮"天赋<br>战斗时有概率直接说服敌人</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '概率：16.7%（6选1）',
                        '效果：解锁"嘴炮"天赋',
                        '天赋效果：战斗时低概率直接说服敌人，不战而胜',
                        '⚠️ 已有该天赋则无效果'
                    ]
                },
                {
                    name: '发现龙',
                    probability: '16.7%（6选1）',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">🐉 发现上古巨龙</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node info">
                                <div class="node-content">⚔️ Boss战</div>
                                <div class="node-detail">等级=玩家等级+5</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="tree-node success">
                                        <div class="node-content">✅ 胜利</div>
                                        <div class="node-detail">💎 可能获得龙翔化石<br>（传说级材料）</div>
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
                        '概率：16.7%（6选1）',
                        '敌人：上古巨龙（等级=玩家+5）',
                        '奖励：可能获得龙翔化石（传说材料）',
                        '风险：战败会死亡',
                        '建议：实力强再挑战'
                    ]
                },
                {
                    name: '黄金史莱姆',
                    probability: '16.7%（6选1）',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">💰 黄金史莱姆</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node info">
                                <div class="node-content">⚔️ 战斗</div>
                                <div class="node-detail">特殊怪物，血厚防高</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-branches">
                                <div class="tree-branch">
                                    <div class="tree-node success">
                                        <div class="node-content">✅ 胜利</div>
                                        <div class="node-detail">💰 获得30000金</div>
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
                        '概率：16.7%（6选1）',
                        '敌人：黄金史莱姆（血厚防高）',
                        '奖励：胜利获得30000金',
                        '风险：战败会死亡',
                        '建议：攻击力不足时慎重'
                    ]
                },
                {
                    name: '美景',
                    probability: '16.7%（6选1）',
                    trigger: '到达仙人岛时随机',
                    flow: `
                        <div class="probability-tree">
                            <div class="tree-node root">
                                <div class="node-content">🌄 欣赏美景</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node success">
                                <div class="node-content">✨ 恢复状态</div>
                                <div class="node-detail">完全恢复生命和耐力</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node info">
                                <div class="node-content">📊 访问计数+1</div>
                                <div class="node-detail">记录仙人岛访问次数</div>
                            </div>
                            <div class="node-arrow">↓</div>
                            <div class="tree-node highlight">
                                <div class="node-content">🎁 每3次访问</div>
                                <div class="node-detail">⚡ 永久负重+10<br>（累计可叠加）</div>
                            </div>
                        </div>
                    `,
                    details: [
                        '概率：16.7%（6选1）',
                        '立即效果：完全恢复生命和耐力',
                        '累计效果：每访问仙人岛3次（任意事件），永久负重+10',
                        '建议：多来仙人岛可以提升负重上限'
                    ]
                }
            ]
        }
    };
    
    return data[cellId] || null;
}

