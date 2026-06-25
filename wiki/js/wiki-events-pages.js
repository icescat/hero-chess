/**
 * 勇者棋 Wiki - 格子事件页面渲染
 * 新的events页面架构
 */

// 等待Wiki类加载完成后添加方法
(function() {
    // 检查Wiki类是否已定义
    if (typeof Wiki === 'undefined') {
        console.error('[wiki-events-pages] Wiki类未定义，将在DOMContentLoaded后重试');
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Wiki !== 'undefined') {
                initWikiEventPages();
            }
        });
        return;
    }
    initWikiEventPages();
})();

function initWikiEventPages() {
    console.log('[wiki-events-pages] 正在添加事件页面方法...');

// 获取格子的事件名称列表
function getCellEventNames(cellId) {
    const data = getCellDetailData(cellId);
    if (!data || !data.events) return [];
    return data.events.map(e => e.name);
}

Wiki.prototype.renderEventsPageNew = function() {
    const html = `
        <div class="page active">
            <h1>🎲 格子事件大全</h1>
            <p class="intro">点击格子名称查看详情，点击事件链接快速跳转</p>
            
            <div class="data-card">
                <h2>🗺️ 棋盘布局</h2>
                <p style="line-height: 2; color: var(--text-secondary);">
                    棋盘共38个格子，环形排列。包含：2座城镇、2个村庄、1个公会、1个竞技场、
                    1个马场、1个营地、1个温泉、1个墓地、2个码头、2个房屋、2个副本、
                    1个仙人岛、18个野外格子
                </p>
            </div>
            
            <div class="cells-grid-detailed">
                ${CELL_TYPES_DATA.map(cell => {
                    const events = getCellEventNames(cell.id);
                    return `
                    <div class="cell-card-detailed">
                        <div class="cell-header" data-cell-id="${cell.id}">
                            <div class="cell-icon">${cell.icon}</div>
                            <div class="cell-info">
                                <div class="cell-name">${cell.name}</div>
                                <div class="cell-desc">${cell.desc}</div>
                            </div>
                            ${cell.count > 1 ? `<div class="cell-count">×${cell.count}</div>` : ''}
                        </div>
                        ${events.length > 0 ? `
                        <div class="cell-events-list">
                            ${events.map((name, idx) => `
                                <a href="#" class="event-link" data-cell="${cell.id}" data-event-idx="${idx}">${name}</a>
                            `).join('')}
                        </div>
                        ` : '<div class="cell-events-list"><span class="no-events">暂无详细数据</span></div>'}
                    </div>
                    `;
                }).join('')}
            </div>
            
            <div class="data-card" style="margin-top: 30px;">
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
    
    // 绑定格子标题点击事件
    document.querySelectorAll('.cell-header').forEach(header => {
        header.addEventListener('click', () => {
            const cellId = header.dataset.cellId;
            this.navigateTo(`cell-${cellId}`);
        });
    });
    
    // 绑定事件链接点击事件
    document.querySelectorAll('.event-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const cellId = link.dataset.cell;
            const eventIdx = link.dataset.eventIdx;
            // 跳转到详情页并滚动到指定事件
            this.navigateTo(`cell-${cellId}`, `event-${cellId}-${eventIdx}`);
        });
    });
};

Wiki.prototype.renderCellDetailPage = function(cellId, scrollToEventId = null) {
    const data = getCellDetailData(cellId);
    
    if (!data) {
        document.getElementById('pageContent').innerHTML = `
            <div class="page active">
                <h1>❌ 数据未找到</h1>
                <p>该格子的详细数据尚未补充，敬请期待...</p>
                <button onclick="wiki.navigateTo('events')" class="btn-primary">返回格子列表</button>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="page active">
            <div class="page-header">
                <button onclick="wiki.navigateTo('events')" class="btn-back">← 返回格子列表</button>
                <h1>${data.title}</h1>
                <p class="intro">${data.description}</p>
                ${data.location ? `<p class="location">📍 位置：${data.location}</p>` : ''}
            </div>
            
            <!-- 事件快速导航 -->
            <div class="event-nav">
                <span class="event-nav-label">📋 事件列表：</span>
                ${data.events.map((event, index) => `
                    <a href="#event-${cellId}-${index}" class="event-nav-link">${event.name}</a>
                `).join('')}
            </div>
            
            ${data.events.map((event, index) => `
                <div class="event-card" id="event-${cellId}-${index}">
                    <div class="event-header">
                        <h2>${index + 1}. ${event.name}</h2>
                        <div class="event-probability">
                            <span class="probability-label">概率</span>
                            <span class="probability-value">${event.probability}</span>
                        </div>
                    </div>
                    
                    <div class="event-trigger">
                        <strong>🎯 触发条件：</strong> ${event.trigger}
                    </div>
                    
                    ${event.flow ? `
                        <div class="event-flow">
                            <h3>📊 事件流程图</h3>
                            ${event.flow}
                        </div>
                    ` : ''}
                    
                    ${event.details ? `
                        <div class="event-details">
                            <h3>📝 详细说明</h3>
                            <ul>
                                ${event.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
            
            <div class="page-footer">
                <button onclick="wiki.navigateTo('events')" class="btn-primary">← 返回格子列表</button>
            </div>
        </div>
    `;
    document.getElementById('pageContent').innerHTML = html;
    
    // 如果指定了滚动目标，滚动到该事件
    if (scrollToEventId) {
        setTimeout(() => {
            const targetElement = document.getElementById(scrollToEventId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // 添加高亮效果
                targetElement.classList.add('event-highlight');
                setTimeout(() => targetElement.classList.remove('event-highlight'), 2000);
            }
        }, 100);
    }
};

    console.log('[wiki-events-pages] 事件页面方法添加成功！');
}

