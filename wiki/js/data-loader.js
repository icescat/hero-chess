/**
 * 数据加载器
 * 从游戏JSON文件加载数据
 */

class DataLoader {
    constructor() {
        this.dataPath = 'data/';
        this.cache = {};
    }
    
    /**
     * 加载JSON文件
     * @param {string} filename - 文件名（不含路径）
     * @returns {Promise} 数据Promise
     */
    async loadJSON(filename) {
        // 检查缓存
        if (this.cache[filename]) {
            return Promise.resolve(this.cache[filename]);
        }
        
        try {
            const response = await fetch(this.dataPath + filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            const data = await response.json();
            this.cache[filename] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return [];
        }
    }
    
    /**
     * 加载所有数据
     * @returns {Promise<Object>} 所有数据对象
     */
    async loadAllData() {
        const [relics, buffs, equips, materials, followers, mounts, bags] = await Promise.all([
            this.loadJSON('relics.json'),
            this.loadJSON('buffs.json'),
            this.loadJSON('equips.json'),
            this.loadJSON('materials.json'),
            this.loadJSON('followers.json'),
            this.loadJSON('mounts.json'),
            this.loadJSON('bags.json')
        ]);
        
        return {
            relics,
            buffs,
            equips,
            materials,
            followers,
            mounts,
            bags
        };
    }
}

// 全局数据加载器实例
window.dataLoader = new DataLoader();

