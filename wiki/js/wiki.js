/**
 * 勇者棋 Wiki 核心脚本
 * V1.0.5 - 完全重构版
 */

class Wiki {
    constructor() {
        this.currentPage = 'welcome';
        this.gameData = {};
        this.init();
    }
    
    async init() {
        // 加载游戏数据
        this.gameData = await window.dataLoader.loadAllData();
        
        // 绑定事件
        this.bindEvents();
        
        // 处理初始URL hash
        this.handleHashChange();
    }
    
    bindEvents() {
        // 导航链接点击
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page || e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // 特性卡片点击
        document.querySelectorAll('[data-goto]').forEach(card => {
            card.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.goto;
                this.navigateTo(page);
            });
        });
        
        // 搜索框
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // 浏览器后退/前进
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
    }
    
    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && hash !== this.currentPage) {
            this.navigateTo(hash);
        }
    }
    
    navigateTo(pageName, scrollToId = null) {
        // 更新导航激活状态
        document.querySelectorAll('.nav-section a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // 渲染页面（传递锚点参数给详情页）
        this.renderPage(pageName, scrollToId);
        
        // 更新URL
        window.location.hash = pageName;
        this.currentPage = pageName;
        
        // 如果没有指定锚点，滚动到顶部
        if (!scrollToId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    renderPage(pageName, scrollToId = null) {
        const contentArea = document.getElementById('pageContent');
        
        // 显示加载状态
        contentArea.innerHTML = '<div class="loading">加载中...</div>';
        
        // 渲染对应页面
        setTimeout(() => {
            switch (pageName) {
                case 'relics':
                    this.renderRelicsPage();
                    break;
                case 'equips':
                    this.renderEquipsPage();
                    break;
                case 'mounts':
                    this.renderMountsPage();
                    break;
                case 'buffs':
                    this.renderBuffsPage();
                    break;
                case 'talents':
                    this.renderTalentsPage();
                    break;
                case 'skills':
                    this.renderSkillsPage();
                    break;
                case 'followers':
                    this.renderFollowersPage();
                    break;
                case 'marriage':
                    this.renderMarriagePage();
                    break;
                case 'events':
                    // 使用新的events页面
                    if (typeof this.renderEventsPageNew === 'function') {
                        this.renderEventsPageNew();
                    } else {
                        this.renderEventsPage();  // 回退到旧版本
                    }
                    break;
                case 'devilland':
                    this.renderDevillandPage();
                    break;
                case 'system':
                    this.renderSystemPage();
                    break;
                default:
                    // 格子详情页（动态路由）或保持欢迎页
                    if (pageName.startsWith('cell-')) {
                        const cellType = pageName.replace('cell-', '');
                        if (typeof this.renderCellDetailPage === 'function') {
                            this.renderCellDetailPage(cellType, scrollToId);
                        }
                    }
                    break;
            }
        }, 100);
    }
    
    // ==================== 页面渲染方法 ====================
    
    renderRelicsPage() {
        const relics = this.gameData.relics || [];
        
        const html = `
            <div class="page active">
                <h1>🎁 遗物系统</h1>
                <p class="intro">永久提升能力的珍贵道具，共${relics.length}种</p>
                
                <div class="data-card">
                    <h2>📋 获取方式</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>公会领取</strong>: 每完成10个委托任务可在公会领取1个随机遗物</li>
                        <li><strong>行脚商人</strong>: 路上随机遇到，出售随机遗物</li>
                        <li><strong>马戏团</strong>: 随机遇到，出售随机遗物（含灵魂石）</li>
                        <li><strong>击败传说怪物</strong>: 可能掉落稀有遗物</li>
                    </ul>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 8%;">编号</th>
                            <th style="width: 18%;">遗物名称</th>
                            <th style="width: 10%;">等级</th>
                            <th style="width: 44%;">效果描述</th>
                            <th style="width: 20%;">获取方式</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relics.map(relic => {
                            const levelBadge = relic.isLegend ? '<span class="rarity-legend">传说</span>' : '<span class="rarity-rare">稀有</span>';
                            const specialNote = relic.special === 'soulstone' ? '<br><span style="color:#e74c3c;">⚠️ 一次性</span>' : '';
                            
                            // 根据遗物类型判断获取方式
                            let getMethod = '公会任务奖励';
                            if (relic.special === 'soulstone') {
                                getMethod = '马戏团购买';
                            } else if (relic.isLegend) {
                                getMethod = '合成或特殊事件';
                            } else if (relic.relicNo >= 12 && relic.relicNo <= 14) {
                                getMethod = '击败传说怪物';
                            }
                            
                            return `
                                <tr>
                                    <td style="text-align: center; color: var(--text-secondary);">#${relic.relicNo}</td>
                                    <td><strong>${relic.name}</strong></td>
                                    <td>${levelBadge}</td>
                                    <td>${relic.desc || '暂无描述'}${specialNote}</td>
                                    <td>${getMethod}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    createRelicCard(relic) {
        const legendBadge = relic.isLegend ? '<span class="card-badge rarity-legend">传说</span>' : '';
        const specialBadge = relic.special === 'soulstone' ? '<span class="card-badge" style="background:#e74c3c;">一次性</span>' : '';
        
        return `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title">${relic.name}</div>
                    <div>${legendBadge} ${specialBadge}</div>
                </div>
                <div class="card-desc">${relic.desc}</div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">编号:</span>
                        <span class="stat-value">#${relic.relicNo}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderEquipsPage() {
        const equipsData = this.gameData.equips || {};
        const weapons = equipsData.weapons || [];
        const armors = equipsData.armors || [];
        
        // 品质名称和颜色映射
        const qualityNames = ['普通', '优秀', '出众', '卓越', '完美', '传说'];
        const qualityColors = ['#808080', '#27ae60', '#3498db', '#9b59b6', '#f39c12', '#e74c3c'];
        
        const html = `
            <div class="page active">
                <h1>⚔️ 装备系统</h1>
                <p class="intro">武器${weapons.length}件、护甲${armors.length}件</p>
                
                <div class="data-card">
                    <h2>🔨 强化系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>强化材料</strong>: 消耗普通/稀有锻材提升强化等级（+1, +2, +3...）</li>
                        <li><strong>成功率</strong>: 每次强化成功率递减（+1: 80%, +2: 60%, +3: 40%...）</li>
                        <li><strong>失败惩罚</strong>: 强化失败装备不会损坏，但不会提升等级</li>
                        <li><strong>属性加成</strong>: 每+1提升基础属性的10%</li>
                        <li><strong>锻造笔记</strong>: 遗物，提高锻造成功率</li>
                    </ul>
                </div>
                
                <h2 style="margin-top: 30px;">⚔️ 武器列表</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 15%;">套装编号</th>
                            <th style="width: 40%;">装备名称</th>
                            <th style="width: 20%;">品质</th>
                            <th style="width: 25%;">攻击力</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${weapons.map(w => {
                            const qualityName = qualityNames[w.quality] || '未知';
                            const qualityColor = qualityColors[w.quality] || '#808080';
                            return `
                                <tr>
                                    <td style="text-align: center;">套装${w.setNo}</td>
                                    <td><strong>${w.name}</strong></td>
                                    <td><span style="color: ${qualityColor}; font-weight: bold;">${qualityName}</span></td>
                                    <td style="color: #e74c3c; font-weight: bold; text-align: center;">⚔️ ${w.attack}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <h2 style="margin-top: 30px;">🛡️ 护甲列表</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 15%;">套装编号</th>
                            <th style="width: 35%;">装备名称</th>
                            <th style="width: 20%;">品质</th>
                            <th style="width: 15%;">防御力</th>
                            <th style="width: 15%;">生命值</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${armors.map(a => {
                            const qualityName = qualityNames[a.quality] || '未知';
                            const qualityColor = qualityColors[a.quality] || '#808080';
                            return `
                                <tr>
                                    <td style="text-align: center;">套装${a.setNo}</td>
                                    <td><strong>${a.name}</strong></td>
                                    <td><span style="color: ${qualityColor}; font-weight: bold;">${qualityName}</span></td>
                                    <td style="color: #3498db; font-weight: bold; text-align: center;">🛡️ ${a.defense}</td>
                                    <td style="color: #e74c3c; font-weight: bold; text-align: center;">❤️ ${a.life}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    createEquipCard(equip) {
        // 根据是否有attack字段判断类型
        const isWeapon = equip.attack !== undefined;
        const typeBadge = isWeapon ? 
            '<span class="card-badge" style="background:#e74c3c;">武器</span>' : 
            '<span class="card-badge" style="background:#3498db;">护甲</span>';
        
        // 品质颜色映射
        const qualityColors = {
            0: '#808080',  // 普通-灰色
            1: '#00ff00',  // 优秀-绿色
            2: '#0080ff'   // 稀有-蓝色
        };
        const qualityColor = qualityColors[equip.quality] || '#808080';
        
        return `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title" style="color: ${qualityColor};">${equip.name}</div>
                    ${typeBadge}
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">套装:</span>
                        <span class="stat-value">${equip.setNo}</span>
                    </div>
                    ${equip.attack ? `<div class="stat-item"><span class="stat-label">攻击:</span><span class="stat-value">+${equip.attack}</span></div>` : ''}
                    ${equip.defense ? `<div class="stat-item"><span class="stat-label">防御:</span><span class="stat-value">+${equip.defense}</span></div>` : ''}
                    ${equip.life ? `<div class="stat-item"><span class="stat-label">生命:</span><span class="stat-value">+${equip.life}</span></div>` : ''}
                    <div class="stat-item">
                        <span class="stat-label">品质:</span>
                        <span class="stat-value" style="color: ${qualityColor};">${['普通', '优秀', '稀有'][equip.quality] || '普通'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMountsPage() {
        const mounts = this.gameData.mounts?.baseMounts || [];
        const bags = this.gameData.bags || [];
        
        const normalMounts = mounts.filter(m => !m.isUnique);
        const legendMounts = mounts.filter(m => m.isUnique);
        
        const html = `
            <div class="page active">
                <h1>🐴 马匹系统</h1>
                <p class="intro">坐骑提升移动效率和战斗属性</p>
                
                <div class="data-card">
                    <h2>🎯 坐骑获取</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>马场购买</strong>: 费用=等级²×1000金</li>
                        <li><strong>击败盗马贼</strong>: 可能获得高级坐骑</li>
                        <li><strong>救助珍兽</strong>: 林地事件，战胜怪物后可能获得坐骑</li>
                        <li><strong>传说坐骑</strong>: 码头5级后可购买幽冥战马</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>💪 坐骑成长</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>马术训练</strong>: 1000金，成长度+10~20</li>
                        <li><strong>赛马大会</strong>: 第1名5000金，第2名2000金，第3名1000金，均可提升成长度</li>
                        <li><strong>改良马种</strong>: 成长度满100后，花费 等级²×2000金 升级马匹</li>
                        <li><strong>成长率</strong>: 决定每次训练/赛马的成长度提升幅度</li>
                    </ul>
                </div>
                
                <h2 style="margin-top: 30px;">🐎 普通坐骑</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">坐骑名称</th>
                            <th style="width: 18%;">攻击加成</th>
                            <th style="width: 18%;">负重加成</th>
                            <th style="width: 18%;">耐力减少</th>
                            <th style="width: 13%;">成长率</th>
                            <th style="width: 8%;">获取</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${normalMounts.map(m => {
                            return `
                                <tr>
                                    <td><strong>${m.name}</strong></td>
                                    <td style="color: #e74c3c;">⚔️ +${m.attack}</td>
                                    <td style="color: #3498db;">📦 +${m.weight}</td>
                                    <td style="color: #27ae60;">-${m.staConsumeReduce} 耐力</td>
                                    <td>${(m.growrate * 100).toFixed(0)}%</td>
                                    <td style="font-size: 12px;">马场</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <h2 style="margin-top: 30px;">⚡ 传说坐骑</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">坐骑名称</th>
                            <th style="width: 18%;">攻击加成</th>
                            <th style="width: 18%;">负重加成</th>
                            <th style="width: 18%;">耐力减少</th>
                            <th style="width: 13%;">成长率</th>
                            <th style="width: 8%;">特殊</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${legendMounts.map(m => {
                            const specialFeatures = [];
                            if (m.canWaterRun) specialFeatures.push('水上行走');
                            
                            return `
                                <tr style="background: rgba(231, 76, 60, 0.05);">
                                    <td><strong style="color: #e74c3c;">${m.name}</strong></td>
                                    <td style="color: #e74c3c; font-weight: bold;">⚔️ +${m.attack}</td>
                                    <td style="color: #3498db; font-weight: bold;">📦 +${m.weight}</td>
                                    <td style="color: #27ae60; font-weight: bold;">-${m.staConsumeReduce} 耐力</td>
                                    <td style="font-weight: bold;">${(m.growrate * 100).toFixed(0)}%</td>
                                    <td style="font-weight: bold; color: #e74c3c; font-size: 12px;">${specialFeatures.join('<br>')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <h2 style="margin-top: 30px;">🎒 背包系统</h2>
                <p class="intro">背包增加负重上限，在铁匠铺升级</p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 10%;">等级</th>
                            <th style="width: 25%;">背包名称</th>
                            <th style="width: 20%;">负重加成</th>
                            <th style="width: 20%;">升级金钱</th>
                            <th style="width: 25%;">升级材料</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bags.map(b => {
                            return `
                                <tr>
                                    <td style="text-align: center;">Lv.${b.level}</td>
                                    <td><strong>${b.name}</strong></td>
                                    <td style="color: #3498db;">📦 +${b.weight}</td>
                                    <td>${b.upgradeCost > 0 ? b.upgradeCost.toLocaleString() + '金' : '初始'}</td>
                                    <td>${b.upgradeStuff > 0 ? b.upgradeStuff + '锻材' : '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="data-card" style="margin-top: 20px;">
                    <h3>📦 负重计算公式</h3>
                    <p style="color: var(--text-secondary); line-height: 2;">
                        <strong>总负重上限</strong> = 基础负重(50) + 背包加成 + 坐骑负重加成 + 永久加成<br>
                        <strong>永久加成来源</strong>: 温泉泡澡(+10~20)、公会负重训练(+10~20)、遗物(无底包+100)、仙人岛事件(+20)
                    </p>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    createMountCard(mount, isLegend = false) {
        const legendBadge = isLegend ? '<span class="card-badge rarity-legend">传说</span>' : '';
        const specialFeatures = [];
        
        if (mount.canWaterRun) specialFeatures.push('可水上行走');
        
        return `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title">${mount.name}</div>
                    ${legendBadge}
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">攻击:</span>
                        <span class="stat-value">+${mount.attack}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">负重:</span>
                        <span class="stat-value">+${mount.weight}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">耐力消耗:</span>
                        <span class="stat-value">-${mount.staConsumeReduce}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">成长率:</span>
                        <span class="stat-value">${(mount.growrate * 100).toFixed(0)}%</span>
                    </div>
                </div>
                ${specialFeatures.length > 0 ? `<div class="card-desc" style="margin-top:12px;"><strong>特性:</strong> ${specialFeatures.join('、')}</div>` : ''}
            </div>
        `;
    }
    
    createBagCard(bag) {
        return `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title">${bag.name}</div>
                    <span class="card-badge">Lv${bag.level}</span>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">负重:</span>
                        <span class="stat-value">+${bag.weight}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">升级费用:</span>
                        <span class="stat-value">${bag.upgradeCost > 0 ? bag.upgradeCost + '金' : '初始'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">升级材料:</span>
                        <span class="stat-value">${bag.upgradeStuff > 0 ? bag.upgradeStuff + '锻材' : '-'}</span>
                    </div>
                </div>
                ${bag.description ? `<div class="card-desc" style="margin-top:12px;">${bag.description}</div>` : ''}
            </div>
        `;
    }
    
    renderBuffsPage() {
        const buffs = this.gameData.buffs || [];
        
        // 过滤掉已废弃的buff（如buffNo 23 马背上的胡萝卜，已被删除）
        const validBuffs = buffs.filter(b => b.buffNo !== 20 && b.buffNo !== 23); // 过滤已废弃的CARROT
        
        const positive = validBuffs.filter(b => !b.isDebuff && !b.isItem);
        const negative = validBuffs.filter(b => b.isDebuff);
        const items = validBuffs.filter(b => b.isItem);
        
        const createBuffTable = (buffList, title, type) => {
            const typeColor = type === 'positive' ? '#27ae60' : type === 'negative' ? '#e74c3c' : '#3498db';
            
            // 获取方式映射函数
            const getSource = (buff) => {
                const desc = buff.description.toLowerCase();
                
                // 根据description和其他字段判断获取方式
                if (desc.includes('婚姻系统')) return '婚姻系统';
                if (desc.includes('休息后')) return '住宿休息';
                if (desc.includes('温泉效果')) return '温泉';
                if (desc.includes('神秘商人出售')) return '行脚商人';
                if (desc.includes('商店道具')) return '城镇商店';
                if (desc.includes('先祖庇佑')) return '墓地祭拜';
                if (desc.includes('牧师随从')) return '牧师随从';
                if (desc.includes('战士随从')) return '战士随从';
                if (desc.includes('老铁匠')) return '温泉遇铁匠';
                if (desc.includes('仙境鲜气')) return '仙人岛';
                if (desc.includes('死亡后')) return '死亡复活';
                if (desc.includes('高昂士气')) return '战斗相关';
                if (desc.includes('负面状态') && !desc.includes('全属性')) return '负面事件';
                if (buff.buffNo === 25) return '魔王岛';
                
                // 默认
                if (buff.isItem) return '城镇商店';
                if (buff.isDebuff) return '负面事件';
                return '特殊事件';
            };
            
            // 清理描述（移除获取方式信息）
            const cleanDescription = (desc) => {
                return desc
                    .replace(/^婚姻系统效果，/, '')
                    .replace(/^休息后获得，/, '')
                    .replace(/^温泉效果，/, '')
                    .replace(/^神秘商人出售，/, '')
                    .replace(/^商店道具，/, '')
                    .replace(/^先祖庇佑，/, '')
                    .replace(/^牧师随从效果，/, '')
                    .replace(/^战士随从效果，/, '')
                    .replace(/^老铁匠效果，/, '')
                    .replace(/^仙境鲜气效果，/, '')
                    .replace(/^死亡后的虚弱状态，/, '')
                    .replace(/^高昂士气，/, '')
                    .replace(/^特殊效果，/, '')
                    .replace(/^负面状态，/, '');
            };
            
            return `
                <h2 style="margin-top: 30px; color: ${typeColor};">${title}（${buffList.length}种）</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 6%;">编号</th>
                            <th style="width: 13%;">名称</th>
                            <th style="width: 35%;">效果描述</th>
                            <th style="width: 18%;">属性影响</th>
                            <th style="width: 8%;">持续</th>
                            <th style="width: 20%;">获取方式</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buffList.map(buff => {
                            const stats = [];
                            // 显示属性倍率变化
                            if (buff.lifeMul && buff.lifeMul !== 0) {
                                const percent = (buff.lifeMul * 100).toFixed(0);
                                stats.push(`生命${buff.lifeMul > 0 ? '+' : ''}${percent}%`);
                            }
                            if (buff.atkMul && buff.atkMul !== 0) {
                                const percent = (buff.atkMul * 100).toFixed(0);
                                stats.push(`攻击${buff.atkMul > 0 ? '+' : ''}${percent}%`);
                            }
                            if (buff.defMul && buff.defMul !== 0) {
                                const percent = (buff.defMul * 100).toFixed(0);
                                stats.push(`防御${buff.defMul > 0 ? '+' : ''}${percent}%`);
                            }
                            if (buff.staMul && buff.staMul !== 0) {
                                const percent = (buff.staMul * 100).toFixed(0);
                                stats.push(`耐力${buff.staMul > 0 ? '+' : ''}${percent}%`);
                            }
                            if (buff.wgtMul && buff.wgtMul !== 0) {
                                const percent = (buff.wgtMul * 100).toFixed(0);
                                stats.push(`负重${buff.wgtMul > 0 ? '+' : ''}${percent}%`);
                            }
                            
                            // 特殊效果描述
                            let specialEffect = '';
                            if (buff.special === 'noStaminaConsume') specialEffect = '移动不消耗耐力';
                            else if (buff.special === 'nearWin') specialEffect = '99%几率直接获胜';
                            else if (buff.special === 'smithBonus') specialEffect = '提高锻造成功率';
                            else if (buff.special === 'waterWalk') specialEffect = '可在水面行走';
                            else if (buff.special === 'goldenDye') specialEffect = '装备染成土豪金';
                            else if (buff.special === 'loveBonus') specialEffect = '亲密度涨得更快';
                            else if (buff.lootMul) specialEffect = `战利品获得+${(buff.lootMul * 100).toFixed(0)}%`;
                            else if (buff.fameMul) specialEffect = `名声获得+${(buff.fameMul * 100).toFixed(0)}%`;
                            else if (buff.expMul) specialEffect = `经验获得+${(buff.expMul * 100).toFixed(0)}%`;
                            
                            const cleanDesc = cleanDescription(buff.description);
                            const finalDesc = specialEffect || cleanDesc;
                            
                            return `
                                <tr>
                                    <td style="text-align: center; color: var(--text-secondary);">#${buff.buffNo}</td>
                                    <td><strong>${buff.name}</strong></td>
                                    <td>${finalDesc}</td>
                                    <td style="font-size: 13px;">${stats.length > 0 ? stats.join('<br>') : '-'}</td>
                                    <td>${buff.duration > 0 ? buff.duration + '回合' : buff.duration === 0 ? '永久' : '-'}</td>
                                    <td style="font-size: 13px;">${getSource(buff)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        };
        
        const html = `
            <div class="page active">
                <h1>✨ Buff效果</h1>
                <p class="intro">游戏中的各种状态效果，共${buffs.length}种</p>
                
                ${createBuffTable(positive, '💚 增益Buff', 'positive')}
                ${createBuffTable(negative, '💔 减益Buff', 'negative')}
                ${createBuffTable(items, '🍖 消耗品', 'item')}
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    createBuffCard(buff) {
        const typeClass = buff.isDebuff ? 'buff-negative' : 'buff-positive';
        
        const stats = [];
        if (buff.lifeMul && buff.lifeMul !== 1) stats.push(`生命×${(buff.lifeMul * 100).toFixed(0)}%`);
        if (buff.atkMul && buff.atkMul !== 1) stats.push(`攻击×${(buff.atkMul * 100).toFixed(0)}%`);
        if (buff.defMul && buff.defMul !== 1) stats.push(`防御×${(buff.defMul * 100).toFixed(0)}%`);
        if (buff.staMul && buff.staMul !== 1) stats.push(`耐力×${(buff.staMul * 100).toFixed(0)}%`);
        if (buff.wgtMul && buff.wgtMul !== 1) stats.push(`负重×${(buff.wgtMul * 100).toFixed(0)}%`);
        
        return `
            <div class="data-card ${typeClass}">
                <div class="card-header">
                    <div class="card-title">${buff.name}</div>
                </div>
                <div class="card-desc">${buff.description}</div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">持续:</span>
                        <span class="stat-value">${buff.duration > 0 ? buff.duration + '回合' : '永久'}</span>
                    </div>
                    ${buff.fee > 0 ? `<div class="stat-item"><span class="stat-label">参考价:</span><span class="stat-value">${buff.fee}金</span></div>` : ''}
                </div>
                ${stats.length > 0 ? `<div class="card-desc" style="margin-top:12px;"><strong>效果:</strong> ${stats.join('、')}</div>` : ''}
            </div>
        `;
    }
    
    renderTalentsPage() {
        const talents = [
            { id: 0, name: '防御', intro: '30%几率降低所受伤害', level: 1 },
            { id: 1, name: '暴击', intro: '20%几率造成双倍伤害', level: 1 },
            { id: 2, name: '闪避', intro: '20%几率避开敌人攻击', level: 1 },
            { id: 3, name: '精准', intro: '命中率提升至95%', level: 1 },
            { id: 4, name: '反击', intro: '防御或闪避敌人攻击后可发起反击', level: 2 },
            { id: 5, name: '破甲', intro: '20%几率使攻击忽略敌人护甲', level: 2 },
            { id: 6, name: '连击', intro: '20%几率发动额外攻击', level: 3 },
            { id: 7, name: '斩杀', intro: '20%几率重创濒死敌人（生命<20%）', level: 3 },
            { id: 8, name: '耐力分流', intro: '濒死时30%几率用10耐力换1000生命', level: 4 },
            { id: 9, name: '乘胜追击', intro: '连续战斗时回复20%生命', level: 4 },
            { id: 10, name: '狂怒', intro: '30%几率攻击×2.5，防御和命中×0.8，持续3回合', level: 5 },
            { id: 11, name: '奥义', intro: '30%几率发动超强力攻击（攻击×6），CD5回合', level: 5 },
            { id: 12, name: '觉醒', intro: '濒死+战斗10回合后，30%几率攻防×4', level: 6 },
            { id: 13, name: '专家防御', intro: '60%几率降低所受伤害', level: 7 },
            { id: 14, name: '专家暴击', intro: '40%几率造成双倍伤害', level: 8 },
            { id: 15, name: '专家闪避', intro: '40%几率避开敌人攻击', level: 9 },
            { id: 16, name: '专家破甲', intro: '40%几率使攻击忽略敌人护甲', level: 10 },
            { id: 17, name: '专家连击', intro: '40%几率发动额外攻击', level: 11 },
            { id: 18, name: '专家斩杀', intro: '40%几率重创濒死敌人', level: 12 },
            { id: 19, name: '嘴炮', intro: '30%几率嘴炮攻击敌人心智（仙人岛习得）', level: 0, special: true },
            { id: 20, name: '一掷千金', intro: '30%几率砸钱伤害敌人（1000-10000金）', level: 0, special: true }
        ];
        
        const normalTalents = talents.filter(t => !t.special);
        const specialTalents = talents.filter(t => t.special);
        
        const html = `
            <div class="page active">
                <h1>⭐ 天赋系统</h1>
                <p class="intro">通过升级解锁天赋，塑造独特的战斗风格</p>
                
                <div class="data-card">
                    <h2>📖 学习规则</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>天赋点</strong>: 每升1级获得1点天赋点</li>
                        <li><strong>学习费用</strong>: 第N级天赋需要N×500金</li>
                        <li><strong>学习地点</strong>: 勇者工会</li>
                        <li><strong>顺序解锁</strong>: 天赋1→2→3...按顺序解锁，不能跳级</li>
                        <li><strong>特殊天赋</strong>: 嘴炮（仙人岛习得）、一掷千金（暂未实现）</li>
                    </ul>
                </div>
                
                <h2 style="margin-top: 30px;">⚔️ 普通天赋（19种）</h2>
                <div class="data-grid">
                    ${normalTalents.map(t => `
                        <div class="data-card">
                            <div class="card-header">
                                <div class="card-title">${t.name}</div>
                                <span class="card-badge">Lv${t.level}</span>
                            </div>
                            <div class="card-desc">${t.intro}</div>
                            <div class="card-stats">
                                <div class="stat-item">
                                    <span class="stat-label">费用:</span>
                                    <span class="stat-value">${t.level * 500}金</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <h2 style="margin-top: 30px;">✨ 特殊天赋（2种）</h2>
                <div class="data-grid">
                    ${specialTalents.map(t => `
                        <div class="data-card">
                            <div class="card-header">
                                <div class="card-title">${t.name}</div>
                                <span class="card-badge" style="background:#9b59b6;">特殊</span>
                            </div>
                            <div class="card-desc">${t.intro}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    renderSkillsPage() {
        const followers = this.gameData.followers?.jobs || [];
        const allSkills = [];
        
        // 收集所有技能
        followers.forEach(follower => {
            if (follower.skills) {
                follower.skills.forEach(skill => {
                    allSkills.push({
                        ...skill,
                        followerName: follower.name
                    });
                });
            }
        });
        
        const battleSkills = allSkills.filter(s => s.type === 'battle');
        const passiveSkills = allSkills.filter(s => s.type === 'passive');
        const activeSkills = allSkills.filter(s => s.type === 'active');
        
        const html = `
            <div class="page active">
                <h1>🎯 技能系统</h1>
                <p class="intro">随从拥有的各种战斗技能和被动能力</p>
                
                <div class="data-card">
                    <h2>📖 技能说明</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>战斗技能</strong>: 战斗中自动触发，增强战斗能力</li>
                        <li><strong>被动技能</strong>: 永久生效，提供各种便利</li>
                        <li><strong>主动技能</strong>: 需要手动触发（法师回城术）</li>
                        <li><strong>技能等级</strong>: 随从等级越高，技能效果越强</li>
                    </ul>
                </div>
                
                <h2 style="margin-top: 30px;" id="battle-skills">⚔️ 战斗技能（${battleSkills.length}种）</h2>
                <div class="data-grid">
                    ${battleSkills.map(s => `
                        <div class="data-card" id="skill-${s.skillNo}">
                            <div class="card-header">
                                <div class="card-title">${s.name}</div>
                                <span class="card-badge" style="background:#e74c3c;">战斗</span>
                            </div>
                            <div class="card-desc">${s.intro}</div>
                            <div class="card-stats">
                                <div class="stat-item">
                                    <span class="stat-label">职业:</span>
                                    <span class="stat-value">${s.followerName}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <h2 style="margin-top: 30px;" id="passive-skills">🛡️ 被动技能（${passiveSkills.length}种）</h2>
                <div class="data-grid">
                    ${passiveSkills.map(s => `
                        <div class="data-card" id="skill-${s.skillNo}">
                            <div class="card-header">
                                <div class="card-title">${s.name}</div>
                                <span class="card-badge" style="background:#27ae60;">被动</span>
                            </div>
                            <div class="card-desc">${s.intro}</div>
                            <div class="card-stats">
                                <div class="stat-item">
                                    <span class="stat-label">职业:</span>
                                    <span class="stat-value">${s.followerName}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${activeSkills.length > 0 ? `
                    <h2 style="margin-top: 30px;" id="active-skills">✨ 主动技能（${activeSkills.length}种）</h2>
                    <div class="data-grid">
                        ${activeSkills.map(s => `
                            <div class="data-card" id="skill-${s.skillNo}">
                                <div class="card-header">
                                    <div class="card-title">${s.name}</div>
                                    <span class="card-badge" style="background:#3498db;">主动</span>
                                </div>
                                <div class="card-desc">${s.intro}</div>
                                <div class="card-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">职业:</span>
                                        <span class="stat-value">${s.followerName}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    renderFollowersPage() {
        const followers = this.gameData.followers?.jobs || [];
        const ranks = this.gameData.followers?.ranks || [];
        
        const html = `
            <div class="page active">
                <h1>👥 随从系统</h1>
                <p class="intro">5种职业随从，5个等级</p>
                
                <div class="data-card">
                    <h2>📖 雇佣规则</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>雇佣地点</strong>: 冒险者营地</li>
                        <li><strong>雇佣费用</strong>: 随等级递增（50金→12800金）</li>
                        <li><strong>材料消耗</strong>: 普通/稀有锻材（数量根据等级）</li>
                        <li><strong>随机生成</strong>: 职业、性别、等级随机</li>
                        <li><strong>亲密度</strong>: 初始10-80，通过战斗/互动提升</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>⭐ 技能解锁系统</h2>
                    <table style="width: 100%; text-align: center; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 10px;">Rank</th>
                                <th style="padding: 10px;">解锁技能</th>
                                <th style="padding: 10px;">说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 10px;"><strong style="color: #888;">Rank 1</strong></td>
                                <td style="padding: 10px; color: #888;">无技能</td>
                                <td style="padding: 10px; font-size: 13px;">只有基础属性加成</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 10px;"><strong style="color: #27ae60;">Rank 2</strong></td>
                                <td style="padding: 10px; color: #27ae60;">+被动技能1</td>
                                <td style="padding: 10px; font-size: 13px;">解锁第1个被动技能</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 10px;"><strong style="color: #e74c3c;">Rank 3</strong></td>
                                <td style="padding: 10px; color: #e74c3c;">+战斗技能1</td>
                                <td style="padding: 10px; font-size: 13px;">解锁第1个战斗技能</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 10px;"><strong style="color: #27ae60;">Rank 4</strong></td>
                                <td style="padding: 10px; color: #27ae60;">+被动技能2</td>
                                <td style="padding: 10px; font-size: 13px;">解锁第2个被动技能</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;"><strong style="color: #e74c3c;">Rank 5</strong></td>
                                <td style="padding: 10px; color: #e74c3c;">+战斗技能2</td>
                                <td style="padding: 10px; font-size: 13px;">全技能解锁（4个）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="data-card">
                    <h2>📊 等级成长</h2>
                    <table style="width: 100%; text-align: center; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 10px;">等级</th>
                                <th style="padding: 10px;">基础Lv</th>
                                <th style="padding: 10px;">雇佣费</th>
                                <th style="padding: 10px;">称号</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ranks.map(r => `
                                <tr style="border-bottom: 1px solid #333;">
                                    <td style="padding: 10px;">${r.rank}级</td>
                                    <td style="padding: 10px;">Lv${r.levelBase}</td>
                                    <td style="padding: 10px;">${r.recruitFee}金</td>
                                    <td style="padding: 10px;">${r.nicknames?.warrior || '未知'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <h2 style="margin-top: 30px;">⚔️ 随从职业</h2>
                <div class="data-grid">
                    ${followers.map(f => this.createFollowerCard(f)).join('')}
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    createFollowerCard(follower) {
        const skillLinks = follower.skills ? follower.skills.map(s => 
            `<a href="#skills" onclick="document.getElementById('skill-${s.skillNo}')?.scrollIntoView({behavior:'smooth'})" 
                style="color: #3498db; cursor: pointer; text-decoration: underline;">${s.name}</a>`
        ).join('、') : '';
        
        return `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title">${follower.name}</div>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">生命加成:</span>
                        <span class="stat-value">${(follower.lifeRatio * 100).toFixed(0)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">攻击加成:</span>
                        <span class="stat-value">${(follower.attackRatio * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div class="card-desc" style="margin-top:12px;"><strong>技能:</strong> ${skillLinks}</div>
            </div>
        `;
    }
    
    renderMarriagePage() {
        const wives = [
            { 
                name: '村长女儿', 
                condition: '村庄触发 → 条件：声望≥500 + 拥有房子 → 礼金80000',
                skills: '可帮助炼金（在家时制作秘药）',
                location: '村庄',
                requirements: '声望500+房子'
            },
            { 
                name: '贵族千金', 
                condition: '城镇触发 → 条件：声望≥1000 + 拥有房子 → 礼金300000',
                skills: '可帮助举办派对（在家时费用减半、效果翻倍）',
                location: '城镇',
                requirements: '声望1000+房子'
            },
            { 
                name: '随从（任意女性职业）', 
                condition: '营地触发 → 条件：随从亲密度达到100 → 无需礼金',
                skills: '保留随从原有技能，可带在身边或留守在家',
                location: '冒险者营地',
                requirements: '女性随从亲密度100'
            },
            { 
                name: '女斗士', 
                condition: '竞技场随机触发 → 条件：女斗士提议 → 无需礼金',
                skills: '可帮助训练（在家时效果+50%）',
                location: '竞技场',
                requirements: '随机事件触发'
            },
            { 
                name: '神秘女子', 
                condition: '特殊事件触发 → 条件：未婚 + 拥有房子 → 无需礼金',
                skills: '神秘力量（具体效果未知）',
                location: '特殊事件',
                requirements: '未婚+房子'
            },
            { 
                name: '兽耳美少女', 
                condition: '特殊事件触发 → 约定将来 → 不是真正结婚',
                skills: '暂时无法结婚，只是约定',
                location: '特殊事件',
                requirements: '未婚+特殊事件'
            }
        ];
        
        const html = `
            <div class="page active">
                <h1>💍 婚姻系统</h1>
                <p class="intro">6种妻子类型，每个玩家只能选择1位妻子</p>
                
                <div class="data-card">
                    <h2>⚠️ 重要规则</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>唯一性</strong>: 整个游戏只能拥有1位妻子，一旦选择无法反悔</li>
                        <li><strong>不同触发地点</strong>: 每种妻子在不同地点触发求婚事件</li>
                        <li><strong>不同条件</strong>: 村长女儿和贵族千金需要房子+声望+礼金</li>
                        <li><strong>随从妻子特殊性</strong>: 可以带在身边或留守在家，灵活切换</li>
                        <li><strong>拒绝后果</strong>: 拒绝后该格子不再触发该妻子的求婚事件</li>
                    </ul>
                </div>
                
                <h2 style="margin-top: 30px;">👰 6种妻子详解</h2>
                <div class="data-grid">
                    ${wives.map(w => `
                        <div class="data-card">
                            <div class="card-header">
                                <div class="card-title">${w.name}</div>
                                <span class="card-badge">${w.location}</span>
                            </div>
                            <div class="card-desc"><strong>获得方式:</strong><br>${w.condition}</div>
                            <div class="card-desc" style="margin-top:12px;"><strong>妻子技能:</strong><br>${w.skills}</div>
                            <div class="card-stats" style="margin-top:12px;">
                                <div class="stat-item">
                                    <span class="stat-label">条件:</span>
                                    <span class="stat-value">${w.requirements}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="data-card" style="margin-top: 30px;">
                    <h2>💰 妻子对比</h2>
                    <table style="width: 100%; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 8px; text-align: left;">妻子</th>
                                <th style="padding: 8px; text-align: left;">触发地点</th>
                                <th style="padding: 8px; text-align: left;">礼金</th>
                                <th style="padding: 8px; text-align: left;">主要技能</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">村长女儿</td>
                                <td style="padding: 8px;">村庄</td>
                                <td style="padding: 8px;">80000金</td>
                                <td style="padding: 8px;">炼金</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">贵族千金</td>
                                <td style="padding: 8px;">城镇</td>
                                <td style="padding: 8px;">300000金</td>
                                <td style="padding: 8px;">派对加成</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">随从</td>
                                <td style="padding: 8px;">营地</td>
                                <td style="padding: 8px;">无</td>
                                <td style="padding: 8px;">保留随从技能+可带身边</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">女斗士</td>
                                <td style="padding: 8px;">竞技场</td>
                                <td style="padding: 8px;">无</td>
                                <td style="padding: 8px;">训练加成</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">神秘女子</td>
                                <td style="padding: 8px;">特殊事件</td>
                                <td style="padding: 8px;">无</td>
                                <td style="padding: 8px;">未知</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;">兽耳美少女</td>
                                <td style="padding: 8px;">特殊事件</td>
                                <td style="padding: 8px;">无</td>
                                <td style="padding: 8px;">约定（暂未实现）</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="data-card" style="margin-top: 30px;">
                    <h2>💖 随从妻子特殊系统</h2>
                    <p style="line-height: 2; color: var(--text-secondary); margin-bottom: 15px;">
                        <strong>只有随从妻子</strong>有这个灵活性，其他妻子只能留在家里
                    </p>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>亲密度提升</strong>: 并肩作战（+1/回合，Boss战×3）、举办派对、完成任务</li>
                        <li><strong>亲密度要求</strong>: 达到100才能求婚</li>
                        <li><strong>灵活切换</strong>: 回到家时可选择带在身边或留守看家</li>
                        <li><strong>永久随从</strong>: 结婚后随从持续时间变为永久</li>
                        <li><strong>保留技能</strong>: 保留原职业的所有战斗技能和被动技能</li>
                    </ul>
                </div>
                
                <div class="data-card" style="margin-top: 30px;">
                    <h2>🏠 房屋互动（需6级房屋+妻子在家）</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>睡觉</strong>: 获得"心满意足"Buff（攻防+30%），完全恢复生命耐力</li>
                        <li><strong>炼金</strong>: 村长女儿可帮助制作秘药（烈焰/坚韧/活力药水）</li>
                        <li><strong>派对</strong>: 贵族千金可使费用减半（15000金）、效果翻倍</li>
                        <li><strong>训练</strong>: 女斗士可使训练效果提升50%</li>
                    </ul>
                </div>
                
                <div class="data-card" style="margin-top: 30px;">
                    <h2>🎯 选择建议</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>经济流</strong>: 村长女儿（炼金赚钱）或贵族千金（派对提升声望）</li>
                        <li><strong>战斗流</strong>: 女斗士（训练加成）或战士/法师随从（战斗技能）</li>
                        <li><strong>生存流</strong>: 牧师随从（绝望祷言20%生命复活）</li>
                        <li><strong>灵活流</strong>: 任意随从（可带身边，保留技能）</li>
                        <li><strong>收藏流</strong>: 神秘女子或兽耳美少女（稀有）</li>
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    renderEventsPage() {
        // 格子类型定义（完整数据移到getCellData方法）
        const cellTypes = [
            { id: 'town', icon: '🏰', name: '城镇', desc: '主城，提供各种服务' },
            {
                icon: '🏘️',
                name: '村庄',
                desc: '小型聚落，可休息和做任务',
                events: [
                    { name: '住宿', desc: '20金（声望满免费），恢复全部生命耐力' },
                    { name: '捐赠材料', desc: '50个普通或10个稀有，大幅提升声望' },
                    { name: '帮忙', desc: '随机事件，可能获得金钱、材料或随从好感' },
                    { name: '求婚', desc: '随从亲密度100时触发，求婚成功变为妻子' }
                ]
            },
            {
                icon: '🛡️',
                name: '勇者工会',
                desc: '学习天赋和领取奖励',
                events: [
                    { name: '学习天赋', desc: '消耗天赋点和金钱解锁天赋' },
                    { name: '训练', desc: '消耗40%耐力获得经验（等级×20）' },
                    { name: '领取遗物', desc: '每完成10个委托可领取1个随机遗物' },
                    { name: '完成任务', desc: '任务目标地点，完成后获得奖励' }
                ]
            },
            {
                icon: '⛺',
                name: '营地',
                desc: '雇佣和训练随从',
                events: [
                    { name: '雇佣随从', desc: '消耗金钱和材料，随机职业性别等级' },
                    { name: '训练随从', desc: '消耗金钱提升随从等级（费用=等级×10）' },
                    { name: '休息', desc: '恢复少量生命和耐力' },
                    { name: '乌鸦王', desc: '低概率触发Boss战，胜利提升营地质量' },
                    { name: '集结先遣军', desc: '名声1500+，招募大量随从用于围攻魔王' }
                ]
            },
            {
                icon: '🐴',
                name: '马场',
                desc: '购买和培育坐骑',
                events: [
                    { name: '购买坐骑', desc: '1000金起，等级越高价格越贵' },
                    { name: '训练坐骑', desc: '消耗金钱和耐力，随机提升属性' },
                    { name: '赛马', desc: '参加比赛，胜利获得金钱和坐骑经验' },
                    { name: '配种', desc: '两匹坐骑配种，可能获得更强后代' },
                    { name: '盗马贼', desc: '低概率触发，击败后可能获得高级坐骑' },
                    { name: '独眼巨人', desc: '极低概率触发，击败后攻击+30' }
                ]
            },
            {
                icon: '🏟️',
                name: '竞技场',
                desc: '参加排名赛',
                events: [
                    { name: '参赛', desc: '消耗耐力，与同级对手战斗' },
                    { name: '观战', desc: '不消耗耐力，获得少量经验（等级×3）' },
                    { name: '排名', desc: 'F→E→D→C→B→A→S→SS→SSS，连胜3次升级' },
                    { name: '奖金', desc: '胜利获得奖金（50→12800金，按排名递增）' },
                    { name: '惩罚', desc: '连败3次降级' }
                ]
            },
            {
                icon: '🚪',
                name: '副本',
                desc: '探索地下城，刷材料和装备',
                events: [
                    { name: '攻略副本', desc: '连续战斗：小怪→精英→BOSS→宝箱' },
                    { name: '临时随从', desc: '进入时随机获得一个临时随从' },
                    { name: '重置副本', desc: '消耗材料重置，可重复刷' },
                    { name: '掠夺', desc: '副本完成后获得大量材料和装备' },
                    { name: '英雄模式', desc: '难度更高，奖励更丰厚' },
                    { name: '宝箱怪', desc: '低概率触发，击败后获得宝箱' }
                ]
            },
            {
                icon: '⚓',
                name: '码头',
                desc: '5阶段建设，解锁船只',
                events: [
                    { name: '阶段1', desc: '50000金 → 解锁渔船（钓鱼）' },
                    { name: '阶段2-4', desc: '每阶段20000金 → 船只升级' },
                    { name: '阶段5', desc: '完成 → 解锁贸易、购买传说坐骑、登岛' },
                    { name: '钓鱼', desc: '获得材料，可能钓到稀有锻材' },
                    { name: '坐船', desc: '可选择去仙人岛或魔王岛' },
                    { name: '贸易', desc: '低买高卖材料（暂未实现）' }
                ]
            },
            {
                icon: '🏠',
                name: '房屋',
                desc: '6阶段建设，获得金钱收益',
                events: [
                    { name: '阶段1', desc: '30000/60000/100000金（根据名声）→ 解锁' },
                    { name: '阶段2-5', desc: '每阶段20000金 → 提升收益' },
                    { name: '阶段6', desc: '完成 → 可带妻子回家，解锁训练/炼金/派对' },
                    { name: '追加投资', desc: '加速建设进度' },
                    { name: '金钱收益', desc: '每圈经过起点获得固定金钱' }
                ]
            },
            {
                icon: '⚰️',
                name: '墓地',
                desc: '神社，可能遇到吸血鬼',
                events: [
                    { name: '祭拜', desc: '暂无特殊效果，安全格子' },
                    { name: '吸血鬼', desc: '低概率触发，击败后吸食灰烬回血300' }
                ]
            },
            {
                icon: '♨️',
                name: '温泉',
                desc: '恢复状态，清除减益',
                events: [
                    { name: '泡温泉', desc: '完全恢复生命耐力' },
                    { name: '清除减益', desc: '移除所有减益Buff（生病、虚弱等）' },
                    { name: '温泉Buff', desc: '获得"温泉"Buff（属性小幅提升）' },
                    { name: '温泉洗礼', desc: '连续3次获得"迷茫"Buff（自动步行）' }
                ]
            },
            {
                icon: '🏝️',
                name: '仙人岛',
                desc: '6种随机事件，需船只到达',
                events: [
                    { name: '高人传功', desc: '获得大量经验（等级×40）' },
                    { 
                        name: '仙女赠装', 
                        desc: '装备掉落湖中遇仙女（40%概率触发）',
                        details: [
                            '触发概率：40%（否则姿势不对，什么都不给）',
                            '影响装备：60%武器，40%护甲',
                            '两种结果（各50%概率）：',
                            '  ① 披外套：赠送下一套装备（如+1→+2，+2→+3）',
                            '  ② 诚实选择：当前装备强化+1（最高+9）',
                            '⚠️ 已是最高套装无法再升级'
                        ]
                    },
                    { name: '学习嘴炮术', desc: '解锁"嘴炮"天赋' },
                    { name: '发现龙', desc: '战斗，可能获得龙翔化石（传说材料）' },
                    { name: '黄金史莱姆', desc: '战斗，胜利获得30000金' },
                    { name: '美景', desc: '恢复状态，每3次永久+10负重' }
                ]
            },
            {
                icon: '🌾',
                name: '平原',
                desc: '野外格子，随机事件',
                events: [
                    { name: '普通战斗', desc: '遇敌战斗，掉落材料' },
                    { name: '发现宝箱', desc: '低概率，获得装备或材料' },
                    { name: '烹饪', desc: '耐力<50%时20%概率，恢复耐力获得Buff' },
                    { name: '随从事件', desc: '10%概率，随从亲密度相关剧情' },
                    { name: '决斗', desc: '低概率，兽斗士挑衅，击败后+名声' }
                ]
            },
            {
                icon: '🌲',
                name: '林地',
                desc: '野外格子，可能救助珍兽',
                events: [
                    { name: '普通战斗', desc: '遇敌战斗，掉落材料' },
                    { name: '救助珍兽', desc: '20%概率，击败欺凌怪物后可能获得坐骑' },
                    { name: '发现宝箱', desc: '低概率，获得装备或材料' },
                    { name: '烹饪', desc: '耐力<50%时20%概率，恢复耐力获得Buff' },
                    { name: '随从事件', desc: '10%概率，随从亲密度相关剧情' }
                ]
            },
            {
                icon: '🏖️',
                name: '海滩',
                desc: '野外格子，可能遇到强盗',
                events: [
                    { name: '普通战斗', desc: '遇敌战斗，掉落材料' },
                    { name: '强盗', desc: '20%概率，选择战斗或花10%金钱消灾' },
                    { name: '发现宝箱', desc: '低概率，获得装备或材料' },
                    { name: '烹饪', desc: '耐力<50%时20%概率，恢复耐力获得Buff' }
                ]
            }
        ];
        
        const html = `
            <div class="page active">
                <h1>🎲 格子事件详解</h1>
                <p class="intro">棋盘上38个格子的详细事件和选项</p>
                
                <div class="data-card">
                    <h2>🗺️ 棋盘布局</h2>
                    <p style="line-height: 2; color: var(--text-secondary);">
                        棋盘共38个格子，环形排列。包含：2座城镇、2个村庄、1个公会、1个竞技场、
                        1个马场、1个营地、1个温泉、1个墓地、2个码头、2个房屋地块、2个副本、
                        1个仙人岛、1个魔王岛、18个野外格子（平原/林地/海滩）
                    </p>
                </div>
                
                ${cellTypes.map(cell => `
                    <div class="data-card" style="margin-top: 20px;">
                        <h2>${cell.icon} ${cell.name}</h2>
                        <p style="line-height: 2; color: var(--text-secondary); margin-bottom: 15px;">${cell.desc}</p>
                        <table style="width: 100%; color: var(--text-secondary);">
                            <thead>
                                <tr style="border-bottom: 1px solid #444;">
                                    <th style="padding: 8px; text-align: left;">事件</th>
                                    <th style="padding: 8px; text-align: left;">说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cell.events.map(e => `
                                    <tr style="border-bottom: 1px solid #333;">
                                        <td style="padding: 8px;"><strong>${e.name}</strong></td>
                                        <td style="padding: 8px;">${e.desc}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
                
                <div class="data-card" style="margin-top: 20px;">
                    <h2>🎰 路上随机事件</h2>
                    <table style="width: 100%; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 8px; text-align: left;">事件</th>
                                <th style="padding: 8px; text-align: left;">触发条件</th>
                                <th style="padding: 8px; text-align: left;">效果</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>材料银行</strong></td>
                                <td style="padding: 8px;">负重>80%</td>
                                <td style="padding: 8px;">自动托管材料到银行</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>行脚商人</strong></td>
                                <td style="padding: 8px;">路上随机</td>
                                <td style="padding: 8px;">出售随机Buff或遗物</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>马戏团</strong></td>
                                <td style="padding: 8px;">路上随机</td>
                                <td style="padding: 8px;">出售随机Buff或遗物（含灵魂石）</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>Buff商店</strong></td>
                                <td style="padding: 8px;">路上随机</td>
                                <td style="padding: 8px;">出售3个指定Buff供选择</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    renderDevillandPage() {
        const html = `
            <div class="page active">
                <h1>🌋 魔王岛</h1>
                <p class="intro">高风险高回报的危险区域，需船只到达</p>
                
                <div class="data-card">
                    <h2>🗺️ 区域介绍</h2>
                    <p style="line-height: 2; color: var(--text-secondary);">
                        魔王岛是游戏中最危险的区域，需要通过建设先遣营地、招募勇士、围攻魔王顶三个阶段才能最终挑战魔王。
                        <strong>这是一个长期准备的过程，建议中后期再来。</strong>
                    </p>
                </div>
                
                <div class="data-card">
                    <h2>⚠️ 前置条件</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>到达方式</strong>: 需从码头（#8或#27）乘船到达</li>
                        <li><strong>名声要求</strong>: 至少1000点名声才能建立先遣营地</li>
                        <li><strong>金钱要求</strong>: 200000金建立营地（首次）</li>
                        <li><strong>等级建议</strong>: 30级以上，装备精良</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>🏗️ 先遣营地建设流程</h2>
                    <table style="width: 100%; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 8px; text-align: left;">进度</th>
                                <th style="padding: 8px; text-align: left;">状态</th>
                                <th style="padding: 8px; text-align: left;">可用操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>0 - 未建设</strong></td>
                                <td style="padding: 8px;">荒岛，魔王爪牙遍布</td>
                                <td style="padding: 8px;">探索四周（名声<1000）/ 建立营地（200000金）</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>1 - 刚开始</strong></td>
                                <td style="padding: 8px;">营地初建，人手不足</td>
                                <td style="padding: 8px;">探索四周 / 营地帮忙（加快建设）</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>2-4 - 建设中</strong></td>
                                <td style="padding: 8px;">营地扩建，可招募勇士</td>
                                <td style="padding: 8px;">探索四周 / 招募勇士 / 营地帮忙</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>5 - 营地建成</strong></td>
                                <td style="padding: 8px;">先遣军集结完毕</td>
                                <td style="padding: 8px;">探索四周 / 招募勇士 / <strong>围攻魔王顶</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    <p style="margin-top: 12px; color: var(--text-secondary); font-size: 14px;">
                        💡 <strong>提示</strong>：营地建设需要60回合基础时间，每次帮忙+15回合。建议多次来回，逐步推进。
                    </p>
                </div>
                
                <div class="data-card">
                    <h2>🌋 探索四周 - 随机事件</h2>
                    <table style="width: 100%; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 8px; text-align: left;">事件</th>
                                <th style="padding: 8px; text-align: left;">概率</th>
                                <th style="padding: 8px; text-align: left;">说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>挑战恶魔王</strong></td>
                                <td style="padding: 8px;">1/6</td>
                                <td style="padding: 8px;">强力Boss战（等级+30），击败获得大量奖励</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>搜刮勇士尸体</strong></td>
                                <td style="padding: 8px;">1/6</td>
                                <td style="padding: 8px;">金钱500-3000，基础锻材6-18，稀有锻材0-12</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>发现囚犯</strong></td>
                                <td style="padding: 8px;">1/6</td>
                                <td style="padding: 8px;">解救被囚禁的勇士（进度≥2才能招募）</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>遇到女妖</strong></td>
                                <td style="padding: 8px;">1/6</td>
                                <td style="padding: 8px;">60%恢复耐力+满足状态，40%获得金钱和材料</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>怪物巢穴</strong></td>
                                <td style="padding: 8px;">1/6</td>
                                <td style="padding: 8px;">遭遇精英怪物或恶魔领主（70%概率）</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>魔粪事件</strong></td>
                                <td style="padding: 8px;">1/6（默认）</td>
                                <td style="padding: 8px;">兽血沸腾Buff，每3次永久+10攻击</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="data-card">
                    <h2>🏰 围攻魔王顶</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>前置条件</strong>: 营地进度达到5（完全建成）</li>
                        <li><strong>耐力消耗</strong>: 消耗6倍移动耐力（不可疲劳出战）</li>
                        <li><strong>战力计算</strong>: 我方战力 = 普通勇士数 + 精英勇士数×5 + 玩家攻击力÷300×5</li>
                        <li><strong>敌方战力</strong>: 固定300点</li>
                        <li><strong>胜利</strong>: 战力>300，解锁魔王岛内部（阶段2）</li>
                        <li><strong>失败</strong>: 战力≤300（20%概率持平也能赢），先遣军全灭，玩家死亡</li>
                        <li><strong>策略</strong>: 可选择按兵不动，继续招募勇士后再战</li>
                    </ul>
                    <p style="margin-top: 12px; color: #ff6b6b; font-size: 14px;">
                        ⚠️ <strong>警告</strong>：失败会导致死亡！确保战力充足或携带复活道具（灵魂石、遗物等）再围攻。
                    </p>
                </div>
                
                <div class="data-card">
                    <h2>👿 魔王岛内部（阶段2）</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>挑战魔王</strong>: 游戏最终Boss，3个阶段</li>
                        <li><strong>阶段1-2</strong>: 魔王分身，等级高，属性强</li>
                        <li><strong>阶段3</strong>: 魔王本体，超高属性</li>
                        <li><strong>战前准备</strong>: 可消耗金钱/遗物削弱魔王</li>
                        <li><strong>胜利奖励</strong>: 击败魔王后获得结局</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>⚠️ 危险提示</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li>魔王岛敌人等级远超玩家，建议30级以上再来</li>
                        <li>随身携带灵魂石，以防死亡</li>
                        <li>雇佣牧师随从，增加生存率</li>
                        <li>学习"耐力分流"、"觉醒"等保命天赋</li>
                        <li>准备充足的秘药Buff再进入</li>
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    renderSystemPage() {
        const html = `
            <div class="page active">
                <h1>⚙️ 游戏系统详解</h1>
                <p class="intro">核心游戏机制和规则</p>
                
                <div class="data-card">
                    <h2>🎲 基本规则</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>游戏目标</strong>: 击败魔王，成为勇者王</li>
                        <li><strong>游戏流程</strong>: 投骰子→移动→触发格子事件→回合结束</li>
                        <li><strong>棋盘</strong>: 38个格子环形排列，经过起点获得200金</li>
                        <li><strong>时间系统</strong>: 2个回合=1天（昼+夜），某些事件只在夜晚触发</li>
                        <li><strong>自动游戏</strong>: 按P键启动/停止，AI自动处理所有选项</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>📊 属性系统</h2>
                    <table style="width: 100%; color: var(--text-secondary);">
                        <thead>
                            <tr style="border-bottom: 1px solid #444;">
                                <th style="padding: 8px; text-align: left;">属性</th>
                                <th style="padding: 8px; text-align: left;">作用</th>
                                <th style="padding: 8px; text-align: left;">提升方式</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>生命</strong></td>
                                <td style="padding: 8px;">战斗血量，归0则死亡</td>
                                <td style="padding: 8px;">升级、装备、Buff、遗物</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>攻击</strong></td>
                                <td style="padding: 8px;">战斗伤害输出</td>
                                <td style="padding: 8px;">升级、装备、随从、坐骑、Buff</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>防御</strong></td>
                                <td style="padding: 8px;">减少受到伤害</td>
                                <td style="padding: 8px;">升级、装备、随从、Buff</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>耐力</strong></td>
                                <td style="padding: 8px;">移动消耗，耗尽需休息</td>
                                <td style="padding: 8px;">休息、温泉、特定Buff</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>负重</strong></td>
                                <td style="padding: 8px;">材料携带上限，超重耐力消耗×2</td>
                                <td style="padding: 8px;">背包、坐骑、遗物、训练</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #333;">
                                <td style="padding: 8px;"><strong>声望</strong></td>
                                <td style="padding: 8px;">影响城镇服务价格</td>
                                <td style="padding: 8px;">任务、捐赠材料、击败敌人</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="data-card">
                    <h2>⚔️ 战斗系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>回合制</strong>: 玩家和敌人轮流攻击，普通敌人30回合，Boss 50回合</li>
                        <li><strong>伤害计算</strong>: 基础伤害 = 攻击力 - 敌人防御力（最低1）</li>
                        <li><strong>暴击</strong>: 造成双倍伤害</li>
                        <li><strong>闪避</strong>: 完全避开攻击</li>
                        <li><strong>防御</strong>: 降低受到伤害</li>
                        <li><strong>破甲</strong>: 攻击忽略敌人防御</li>
                        <li><strong>连击</strong>: 发动额外攻击</li>
                        <li><strong>斩杀</strong>: 重创濒死敌人（生命<20%）</li>
                        <li><strong>超时</strong>: 达到最大回合未分胜负，玩家撤退</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>💀 死亡与复活（V1.0.5）</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>救命判定顺序</strong>: 牧师恢复 → 耐力分流 → 觉醒 → 绝望祷言 → 灵魂石</li>
                        <li><strong>牧师恢复</strong>: 战斗中回复玩家生命（等级越高概率越大）</li>
                        <li><strong>耐力分流</strong>: 濒死时30%几率用10耐力换1000生命</li>
                        <li><strong>觉醒</strong>: 濒死+战斗10回合后30%几率攻防×4</li>
                        <li><strong>绝望祷言</strong>: 牧师随从，死亡时20%生命复活</li>
                        <li><strong>灵魂石</strong>: 遗物，死亡时满血复活并延长战斗时间（一次性）</li>
                        <li><strong>普通死亡</strong>: 所有救命手段失败，传送回最近城镇</li>
                        <li><strong>死亡惩罚</strong>: 损失20%金钱+30%材料（向上取整）</li>
                        <li><strong>复活流程</strong>: 点击复活按钮 → 商队救助 → 支付医疗费 → 满血满耐力复活</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>📈 升级系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>经验公式</strong>: 下一级所需经验 = 100×(当前等级)²</li>
                        <li><strong>属性成长</strong>: 每级随机+100生命 或 +10攻击 或 +5防御</li>
                        <li><strong>天赋点</strong>: 每级获得1点天赋点</li>
                        <li><strong>耐力上限</strong>: 固定100点（可通过Buff和遗物提升）</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>🎯 任务系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>任务类型</strong>: 送信、寻宝、搜救、怪物侵袭、凯旋</li>
                        <li><strong>时间限制</strong>: 大部分任务有天数限制，超时失败</li>
                        <li><strong>任务奖励</strong>: 经验、金钱、声望（完成时结算）</li>
                        <li><strong>失败条件</strong>: 超时、玩家死亡（部分任务）、战斗失败</li>
                        <li><strong>遗物奖励</strong>: 每完成10个委托可在公会领取遗物</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>🏗️ 建设系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>码头</strong>: 5阶段，总投资130000金，解锁船只和贸易</li>
                        <li><strong>房屋</strong>: 6阶段，总投资130000-230000金（根据名声），每圈获得金钱</li>
                        <li><strong>建设速度</strong>: 投资后每圈自动增加进度，可追加投资加速</li>
                        <li><strong>收益</strong>: 房屋每圈经过起点获得金钱，等级越高收益越多</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>💰 经济系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>金钱获取</strong>: 经过起点、战斗掉落、任务奖励、出售装备</li>
                        <li><strong>材料获取</strong>: 战斗掉落、钓鱼、副本掠夺、宝箱</li>
                        <li><strong>材料类型</strong>: 普通锻材、稀有锻材、垃圾（可出售）</li>
                        <li><strong>银行系统</strong>: 城镇存放材料，10金/个，回收50金/200金</li>
                        <li><strong>负重管理</strong>: 超重耐力消耗×2，需及时存放材料</li>
                    </ul>
                </div>
                
                <div class="data-card">
                    <h2>🔄 圈数系统</h2>
                    <ul style="line-height: 2; color: var(--text-secondary);">
                        <li><strong>完成一圈</strong>: 经过起点（索引0）计为1圈</li>
                        <li><strong>圈数奖励</strong>: 经过起点获得200金</li>
                        <li><strong>房屋收益</strong>: 每圈获得固定金钱</li>
                        <li><strong>标志重置</strong>: 某些事件标志每圈重置（如材料银行托管）</li>
                        <li><strong>自动保存</strong>: 每完成一圈自动保存游戏进度</li>
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = html;
    }
    
    // ==================== 辅助功能 ====================
    
    handleSearch(query) {
        if (!query) {
            // 清空搜索，恢复所有卡片显示
            document.querySelectorAll('.data-card').forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const cards = document.querySelectorAll('.data-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(lowerQuery) ? 'block' : 'none';
        });
    }
}

// 初始化Wiki
document.addEventListener('DOMContentLoaded', () => {
    window.wiki = new Wiki();
});
