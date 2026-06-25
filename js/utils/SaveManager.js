/**
 * 存档管理器
 * 对应 AS3: csh.utils.SaveTool
 * 
 * 功能：
 * 1. 使用localStorage存储游戏数据
 * 2. 自动存档和手动存档
 * 3. 读档功能
 * 4. 存档槽管理（3个存档位）
 */

class SaveManager {
    static SAVE_KEY_PREFIX = 'heroquest_save_';
    static AUTO_SAVE_KEY = 'heroquest_autosave';
    static MAX_SAVE_SLOTS = 3;
    
    /**
     * 保存游戏数据到指定槽位
     * @param {number} slot 存档槽位（0=自动存档, 1-3=手动存档）
     * @param {Object} data 游戏数据
     * @returns {boolean} 是否成功
     */
    static saveGame(slot, data) {
        try {
            const key = slot === 0 ? 
                SaveManager.AUTO_SAVE_KEY : 
                SaveManager.SAVE_KEY_PREFIX + slot;
            
            // 添加存档时间戳
            data.saveTime = Date.now();
            data.saveDate = new Date().toLocaleString('zh-CN');
            
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            
            console.log(`[SaveManager] 游戏已保存到槽位${slot}`);
            return true;
        } catch (e) {
            console.error('[SaveManager] 保存失败:', e);
            return false;
        }
    }
    
    /**
     * 从指定槽位读取游戏数据
     * @param {number} slot 存档槽位（0=自动存档, 1-3=手动存档）
     * @returns {Object|null} 游戏数据
     */
    static loadGame(slot) {
        try {
            const key = slot === 0 ? 
                SaveManager.AUTO_SAVE_KEY : 
                SaveManager.SAVE_KEY_PREFIX + slot;
            
            const jsonData = localStorage.getItem(key);
            if (!jsonData) {
                console.log(`[SaveManager] 槽位${slot}无存档`);
                return null;
            }
            
            const data = JSON.parse(jsonData);
            console.log(`[SaveManager] 从槽位${slot}读取存档`);
            return data;
        } catch (e) {
            console.error('[SaveManager] 读取失败:', e);
            return null;
        }
    }
    
    /**
     * 删除指定槽位的存档
     * @param {number} slot 存档槽位
     * @returns {boolean} 是否成功
     */
    static deleteSave(slot) {
        try {
            const key = slot === 0 ? 
                SaveManager.AUTO_SAVE_KEY : 
                SaveManager.SAVE_KEY_PREFIX + slot;
            
            localStorage.removeItem(key);
            console.log(`[SaveManager] 已删除槽位${slot}的存档`);
            return true;
        } catch (e) {
            console.error('[SaveManager] 删除失败:', e);
            return false;
        }
    }
    
    /**
     * 获取存档槽位信息
     * @param {number} slot 存档槽位
     * @returns {Object|null} 存档信息
     */
    static getSaveInfo(slot) {
        try {
            const key = slot === 0 ? 
                SaveManager.AUTO_SAVE_KEY : 
                SaveManager.SAVE_KEY_PREFIX + slot;
            
            const jsonData = localStorage.getItem(key);
            if (!jsonData) {
                return null;
            }
            
            const data = JSON.parse(jsonData);
            
            // 返回基本信息
            return {
                slot: slot,
                saveDate: data.saveDate || '未知时间',
                saveTime: data.saveTime || 0,
                // 主角信息
                heroLevel: data.hero?.prop?.level || 1,
                heroGold: data.hero?.prop?.gold || 0,
                // 游戏进度
                round: data.round || 0,
                daylapse: data.daylapse || 1,
                yearlapse: data.yearlapse || 1,
                gameCleared: data.gameCleared || false
            };
        } catch (e) {
            console.error('[SaveManager] 获取存档信息失败:', e);
            return null;
        }
    }
    
    /**
     * 获取所有存档槽位信息
     * @returns {Array<Object>} 存档信息数组
     */
    static getAllSaveInfo() {
        const saves = [];
        
        // 自动存档
        saves.push(SaveManager.getSaveInfo(0));
        
        // 手动存档（1-3）
        for (let i = 1; i <= SaveManager.MAX_SAVE_SLOTS; i++) {
            saves.push(SaveManager.getSaveInfo(i));
        }
        
        return saves;
    }
    
    /**
     * 检查是否有自动存档
     * @returns {boolean}
     */
    static hasAutoSave() {
        return SaveManager.getSaveInfo(0) !== null;
    }
    
    /**
     * 自动存档
     * @param {Object} data 游戏数据
     * @returns {boolean}
     */
    static autoSave(data) {
        return SaveManager.saveGame(0, data);
    }
    
    /**
     * 清空所有存档
     * @returns {boolean}
     */
    static clearAllSaves() {
        try {
            // 清空自动存档
            SaveManager.deleteSave(0);
            
            // 清空手动存档
            for (let i = 1; i <= SaveManager.MAX_SAVE_SLOTS; i++) {
                SaveManager.deleteSave(i);
            }
            
            console.log('[SaveManager] 所有存档已清空');
            return true;
        } catch (e) {
            console.error('[SaveManager] 清空存档失败:', e);
            return false;
        }
    }
    
    /**
     * 导出存档为JSON文件（备份）
     * @param {number} slot 存档槽位
     */
    static exportSave(slot) {
        const data = SaveManager.loadGame(slot);
        if (!data) {
            console.error('[SaveManager] 无法导出空存档');
            return;
        }
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `heroquest_save_${slot}_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log(`[SaveManager] 存档${slot}已导出`);
    }
    
    /**
     * 从JSON文件导入存档
     * @param {File} file 文件对象
     * @param {number} slot 存档槽位
     * @param {Function} callback 回调函数
     */
    static importSave(file, slot, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = SaveManager.saveGame(slot, data);
                if (callback) {
                    callback(success, data);
                }
            } catch (error) {
                console.error('[SaveManager] 导入存档失败:', error);
                if (callback) {
                    callback(false, null);
                }
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * 获取localStorage使用情况
     * @returns {Object} 使用情况统计
     */
    static getStorageUsage() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length + key.length;
                }
            }
        }
        
        // 转换为KB
        const usedKB = (totalSize / 1024).toFixed(2);
        const maxKB = 5120; // 假设5MB限制
        const usagePercent = ((totalSize / (maxKB * 1024)) * 100).toFixed(2);
        
        return {
            used: usedKB + ' KB',
            total: maxKB + ' KB',
            percent: usagePercent + '%'
        };
    }
}

