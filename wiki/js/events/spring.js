/**
 * 温泉事件详细数据
 * 位置：#35
 */

const SPRING_EVENTS = {
    id: 'spring',
    title: '♨️ 温泉',
    description: '免费休息和治疗，清除负面状态，有小概率遇到美女',
    location: '#35',
    events: [
        {
            name: '泡温泉',
            probability: '玩家选择',
            trigger: '每次到达都可选择',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">♨️ 泡温泉</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 完全恢复</div>
                        <div class="node-detail">生命和耐力100%<br>免费无消耗</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node highlight">
                        <div class="node-content">🧹 清除异常</div>
                        <div class="node-detail">移除疾病、中毒等<br>所有负面Buff</div>
                    </div>
                </div>
            `,
            details: [
                '消耗：完全免费',
                '效果1：生命和耐力完全恢复',
                '效果2：清除所有负面Buff',
                '负面Buff包括：',
                '  🤢 疾病',
                '  🤮 中毒',
                '  😵 虚弱',
                '  🩹 受伤',
                '⚠️ 游戏中最好的休息点'
            ]
        },
        {
            name: '温泉偷窥事件',
            probability: '5%概率',
            trigger: '泡温泉时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👀 发现偷窥者</div>
                        <div class="node-detail">有人在偷看！</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💢 追击</div>
                        <div class="node-detail">抓到偷窥狂</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">💰 索要赔偿</div>
                        <div class="node-detail">获得2000金</div>
                    </div>
                </div>
            `,
            details: [
                '触发：5%概率，泡温泉时判定',
                '流程：发现偷窥→追击→索赔',
                '奖励：金钱+2000',
                '💡 意外之财'
            ]
        },
        {
            name: '铁匠大师事件',
            probability: '10%概率（间隔>3圈）',
            trigger: '泡温泉时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🔨 遇到铁匠大师</div>
                        <div class="node-detail">传说中的锻造师</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💎 免费强化</div>
                        <div class="node-detail">装备套装+1<br>100%成功率</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 有装备</div>
                                <div class="node-detail">装备强化+1<br>不消耗材料</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node info">
                                <div class="node-content">❌ 无装备</div>
                                <div class="node-detail">错失良机<br>只能聊天</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：10%概率，需间隔3圈以上',
                '条件：有装备且未满级',
                '效果：装备套装等级+1（100%成功）',
                '消耗：完全免费，不需要材料',
                '⚠️ 非常珍贵的强化机会',
                '💡 建议在装备较高等级时触发最划算'
            ]
        },
        {
            name: '珍兽袭击',
            probability: '10%概率',
            trigger: '泡温泉时判定',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🦄 珍兽出现</div>
                        <div class="node-detail">稀有神兽</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">⚔️ 战斗</div>
                        <div class="node-detail">特殊敌人<br>等级 = max(10, 玩家等级+5)</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">✅ 胜利</div>
                                <div class="node-detail">⚡ 永久防御+30</div>
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
                '触发：10%概率，泡温泉时判定',
                '敌人：珍兽（精英级）',
                'Boss等级：max(10, 玩家等级+5)',
                '胜利奖励：永久防御+30',
                '失败：死亡，传送回最近城镇复活',
                '⚠️ 建议至少15级以上再挑战',
                '💡 永久属性提升非常值得'
            ]
        },
        {
            name: '遇到美女',
            probability: '低概率触发',
            trigger: '随机事件',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">👀 发现美女</div>
                        <div class="node-detail">温泉相遇</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node info">
                        <div class="node-content">💬 对话</div>
                        <div class="node-detail">搭讪机会</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-branches">
                        <div class="tree-branch">
                            <div class="tree-node success">
                                <div class="node-content">😊 好感度提升</div>
                                <div class="node-detail">留下好印象<br>为求婚做准备</div>
                            </div>
                        </div>
                        <div class="tree-branch">
                            <div class="tree-node fail">
                                <div class="node-content">😑 无事发生</div>
                                <div class="node-detail">只是普通聊天</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            details: [
                '触发：低概率随机事件',
                '效果：提升某位女性NPC的好感度',
                '后续：好感度高可在城镇求婚',
                '💡 浪漫邂逅的机会'
            ]
        },
        {
            name: '温泉疗伤',
            probability: '特殊情况',
            trigger: '受重伤时自动生效',
            flow: `
                <div class="probability-tree">
                    <div class="tree-node root">
                        <div class="node-content">🩹 疗伤效果增强</div>
                    </div>
                    <div class="node-arrow">↓</div>
                    <div class="tree-node success">
                        <div class="node-content">✅ 特殊恢复</div>
                        <div class="node-detail">伤势快速愈合<br>移除严重负面状态</div>
                    </div>
                </div>
            `,
            details: [
                '触发：生命<20%或有严重负面状态',
                '效果：完全恢复，效果更明显',
                '特别提示：会有额外的鼓励台词',
                '💡 危急时刻的救命稻草'
            ]
        }
    ]
};


