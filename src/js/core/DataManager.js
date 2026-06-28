/**
 * 数据管理器（单例）
 * 功能：
 * 1. 统一加载所有JSON数据
 * 2. 提供数据查询接口
 * 3. 支持数据缓存和索引
 * 4. 支持热重载（调试用）
 */
class DataManager {
    static _instance = null;
    static _loaded = false;
    static _data = {};
    static _indexes = {};
    
    // 数据文件配置
    static DATA_FILES = {
        buffs: 'assets/data/buffs.json',
        relics: 'assets/data/relics.json',
        equips: 'assets/data/equips.json',
        materials: 'assets/data/materials.json',
        mounts: 'assets/data/mounts.json',
        followers: 'assets/data/followers.json',
        bags: 'assets/data/bags.json'
    };
    
    /**
     * 初始化并加载所有数据
     */
    static async init() {
        if (this._loaded) {
            console.log('[DataManager] 数据已加载，跳过');
            return;
        }
        
        console.log('[DataManager] 开始加载游戏数据...');
        const startTime = Date.now();
        
        try {
            // 并行加载所有JSON文件
            const promises = Object.entries(this.DATA_FILES).map(
                async ([key, path]) => {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`加载失败: ${path} (${response.status})`);
                    }
                    this._data[key] = await response.json();
                    console.log(`[DataManager] ✓ ${key}: ${this._data[key].length}条数据`);
                }
            );
            
            await Promise.all(promises);
            
            // 建立索引（性能优化）
            this._buildIndexes();
            
            // 数据校验
            this._validate();
            
            this._loaded = true;
            const elapsed = Date.now() - startTime;
            console.log(`[DataManager] ✅ 数据加载完成！耗时${elapsed}ms`);
            
        } catch (error) {
            console.error('[DataManager] ❌ 数据加载失败:', error);
            throw error;
        }
    }
    
    /**
     * 建立索引（加速查询）
     */
    static _buildIndexes() {
        // Buff索引：buffNo -> buff对象
        this._indexes.buffs = new Map();
        this._data.buffs.forEach(buff => {
            this._indexes.buffs.set(buff.buffNo, buff);
        });
        
        // Relic索引：relicNo -> relic对象
        this._indexes.relics = new Map();
        this._data.relics.forEach(relic => {
            this._indexes.relics.set(relic.relicNo, relic);
        });
        
        // Weapon索引：setNo -> weapon对象
        this._indexes.weapons = new Map();
        this._data.equips.weapons.forEach(weapon => {
            this._indexes.weapons.set(weapon.setNo, weapon);
        });
        
        // Armor索引：setNo -> armor对象
        this._indexes.armors = new Map();
        this._data.equips.armors.forEach(armor => {
            this._indexes.armors.set(armor.setNo, armor);
        });
        
        // Material索引：setNo -> material对象
        this._indexes.materials = new Map();
        this._data.materials.forEach(material => {
            this._indexes.materials.set(material.setNo, material);
        });
        
        // Mount索引：mountNo -> mount对象
        this._indexes.mounts = new Map();
        this._data.mounts.baseMounts.forEach(mount => {
            this._indexes.mounts.set(mount.mountNo, mount);
        });
        
        // Bag索引：level -> bag对象
        this._indexes.bags = new Map();
        this._data.bags.bags.forEach(bag => {
            this._indexes.bags.set(bag.level, bag);
        });
        
        // Follower Job索引：jobNo -> job对象
        this._indexes.followerJobs = new Map();
        this._data.followers.jobs.forEach(job => {
            this._indexes.followerJobs.set(job.jobNo, job);
        });
        
        // Follower Rank索引：rank -> rank对象
        this._indexes.followerRanks = new Map();
        this._data.followers.ranks.forEach(rank => {
            this._indexes.followerRanks.set(rank.rank, rank);
        });
        
        console.log('[DataManager] 索引建立完成');
    }
    
    /**
     * 数据校验
     */
    static _validate() {
        const errors = [];
        
        // 检查Buff数据完整性
        this._data.buffs.forEach((buff, index) => {
            if (!buff.buffNo) {
                errors.push(`Buff[${index}] 缺少buffNo`);
            }
            if (!buff.name) {
                errors.push(`Buff[${index}] 缺少name`);
            }
            if (buff.duration < 0) {
                errors.push(`Buff[${index}] duration异常: ${buff.duration}`);
            }
            // 检查类型有效性（1=战斗属性, 2=旅行属性, 3=特殊效果, 4=虚弱等复活后状态）
            // 注：buffNo 24 为预留编号，暂未使用。如需新增 Buff 请使用 26 起。
            if (![1, 2, 3, 4].includes(buff.type)) {
                errors.push(`Buff[${index}] type异常: ${buff.type}`);
            }
        });
        
        // 检查Relic数据完整性
        this._data.relics.forEach((relic, index) => {
            if (!relic.relicNo) {
                errors.push(`Relic[${index}] 缺少relicNo`);
            }
            if (!relic.name) {
                errors.push(`Relic[${index}] 缺少name`);
            }
            if (!relic.description) {
                errors.push(`Relic[${index}] 缺少description`);
            }
            // 检查类型有效性
            if (![1, 2, 3].includes(relic.type)) {
                errors.push(`Relic[${index}] type异常: ${relic.type}`);
            }
        });
        
        // 检查Weapon数据完整性
        this._data.equips.weapons.forEach((weapon, index) => {
            if (weapon.setNo === undefined) {
                errors.push(`Weapon[${index}] 缺少setNo`);
            }
            if (!weapon.name) {
                errors.push(`Weapon[${index}] 缺少name`);
            }
            if (weapon.attack === undefined) {
                errors.push(`Weapon[${index}] 缺少attack`);
            }
            if (![0, 1, 2, 3, 4].includes(weapon.quality)) {
                errors.push(`Weapon[${index}] quality异常: ${weapon.quality}`);
            }
        });
        
        // 检查Armor数据完整性
        this._data.equips.armors.forEach((armor, index) => {
            if (armor.setNo === undefined) {
                errors.push(`Armor[${index}] 缺少setNo`);
            }
            if (!armor.name) {
                errors.push(`Armor[${index}] 缺少name`);
            }
            if (armor.defense === undefined) {
                errors.push(`Armor[${index}] 缺少defense`);
            }
            if (armor.life === undefined) {
                errors.push(`Armor[${index}] 缺少life`);
            }
            if (![0, 1, 2, 3, 4].includes(armor.quality)) {
                errors.push(`Armor[${index}] quality异常: ${armor.quality}`);
            }
        });
        
        // 检查Material数据完整性
        this._data.materials.forEach((material, index) => {
            if (material.setNo === undefined) {
                errors.push(`Material[${index}] 缺少setNo`);
            }
            if (material.stuff === undefined) {
                errors.push(`Material[${index}] 缺少stuff`);
            }
            if (material.rare === undefined) {
                errors.push(`Material[${index}] 缺少rare`);
            }
        });
        
        // 检查Mount数据完整性
        this._data.mounts.baseMounts.forEach((mount, index) => {
            if (!mount.mountNo) {
                errors.push(`Mount[${index}] 缺少mountNo`);
            }
            if (!mount.name) {
                errors.push(`Mount[${index}] 缺少name`);
            }
            if (mount.attack === undefined) {
                errors.push(`Mount[${index}] 缺少attack`);
            }
        });
        
        // 检查Bag数据完整性
        this._data.bags.bags.forEach((bag, index) => {
            if (!bag.level) {
                errors.push(`Bag[${index}] 缺少level`);
            }
            if (!bag.name) {
                errors.push(`Bag[${index}] 缺少name`);
            }
        });
        
        // 检查Follower Job数据完整性
        this._data.followers.jobs.forEach((job, index) => {
            if (!job.jobNo) {
                errors.push(`FollowerJob[${index}] 缺少jobNo`);
            }
            if (!job.name) {
                errors.push(`FollowerJob[${index}] 缺少name`);
            }
            if (!job.skills || job.skills.length !== 4) {
                errors.push(`FollowerJob[${index}] 技能数量错误，应为4个`);
            }
        });
        
        // 检查Follower Rank数据完整性
        this._data.followers.ranks.forEach((rank, index) => {
            if (!rank.rank) {
                errors.push(`FollowerRank[${index}] 缺少rank`);
            }
            if (!rank.levelBase) {
                errors.push(`FollowerRank[${index}] 缺少levelBase`);
            }
        });
        
        if (errors.length > 0) {
            console.error('[DataManager] ⚠️ 数据校验发现问题:', errors);
            // 不抛出错误，允许继续运行（便于调试）
        } else {
            console.log('[DataManager] ✓ 数据校验通过');
        }
    }
    
    /**
     * 获取Buff数据
     * @param {number} buffNo - Buff编号
     * @returns {Object|null}
     */
    static getBuff(buffNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const buff = this._indexes.buffs.get(buffNo);
        if (!buff) {
            console.warn(`[DataManager] 未找到Buff: ${buffNo}`);
        }
        return buff || null;
    }
    
    /**
     * 获取所有Buff
     * @param {Object} filter - 过滤条件 {type: 1, isDebuff: false}
     * @returns {Array}
     */
    static getBuffs(filter = {}) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        let result = this._data.buffs;
        
        // 应用过滤器
        if (filter.type !== undefined) {
            result = result.filter(b => b.type === filter.type);
        }
        if (filter.isDebuff !== undefined) {
            result = result.filter(b => b.isDebuff === filter.isDebuff);
        }
        if (filter.isItem !== undefined) {
            result = result.filter(b => b.isItem === filter.isItem);
        }
        
        return result;
    }
    
    /**
     * 获取Relic数据
     * @param {number} relicNo - 遗物编号
     * @returns {Object|null}
     */
    static getRelic(relicNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const relic = this._indexes.relics.get(relicNo);
        if (!relic) {
            console.warn(`[DataManager] 未找到Relic: ${relicNo}`);
        }
        return relic || null;
    }
    
    /**
     * 获取所有Relic
     * @param {Object} filter - 过滤条件 {type: 1, isLegend: true}
     * @returns {Array}
     */
    static getRelics(filter = {}) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        let result = this._data.relics;
        
        // 应用过滤器
        if (filter.type !== undefined) {
            result = result.filter(r => r.type === filter.type);
        }
        if (filter.isLegend !== undefined) {
            result = result.filter(r => r.isLegend === filter.isLegend);
        }
        
        return result;
    }
    
    /**
     * 获取Weapon数据
     * @param {number} setNo - 套装编号
     * @returns {Object|null}
     */
    static getWeapon(setNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const weapon = this._indexes.weapons.get(setNo);
        if (!weapon) {
            console.warn(`[DataManager] 未找到Weapon: ${setNo}`);
        }
        return weapon || null;
    }
    
    /**
     * 获取所有Weapon
     * @param {Object} filter - 过滤条件 {quality: 3}
     * @returns {Array}
     */
    static getWeapons(filter = {}) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        let result = this._data.equips.weapons;
        
        // 应用过滤器
        if (filter.quality !== undefined) {
            result = result.filter(w => w.quality === filter.quality);
        }
        
        return result;
    }
    
    /**
     * 获取Armor数据
     * @param {number} setNo - 套装编号
     * @returns {Object|null}
     */
    static getArmor(setNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const armor = this._indexes.armors.get(setNo);
        if (!armor) {
            console.warn(`[DataManager] 未找到Armor: ${setNo}`);
        }
        return armor || null;
    }
    
    /**
     * 获取所有Armor
     * @param {Object} filter - 过滤条件 {quality: 3}
     * @returns {Array}
     */
    static getArmors(filter = {}) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        let result = this._data.equips.armors;
        
        // 应用过滤器
        if (filter.quality !== undefined) {
            result = result.filter(a => a.quality === filter.quality);
        }
        
        return result;
    }
    
    /**
     * 获取Material数据
     * @param {number} setNo - 套装编号
     * @returns {Object|null}
     */
    static getMaterial(setNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const material = this._indexes.materials.get(setNo);
        if (!material) {
            console.warn(`[DataManager] 未找到Material: ${setNo}`);
        }
        return material || null;
    }
    
    /**
     * 获取所有Material
     * @returns {Array}
     */
    static getMaterials() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        return this._data.materials;
    }
    
    /**
     * 获取Mount数据
     * @param {number} mountNo - 坐骑编号
     * @returns {Object|null}
     */
    static getMount(mountNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const mount = this._indexes.mounts.get(mountNo);
        if (!mount) {
            console.warn(`[DataManager] 未找到Mount: ${mountNo}`);
        }
        return mount || null;
    }
    
    /**
     * 获取所有基础坐骑
     * @returns {Array}
     */
    static getBaseMounts() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        return this._data.mounts.baseMounts;
    }
    
    /**
     * 获取高级坐骑配置
     * @returns {Object}
     */
    static getAdvancedMounts() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return {};
        }
        
        return this._data.mounts.advancedMounts;
    }
    
    /**
     * 获取背包数据
     * @param {number} level - 背包等级
     * @returns {Object|null}
     */
    static getBag(level) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const bag = this._indexes.bags.get(level);
        if (!bag) {
            console.warn(`[DataManager] 未找到Bag: ${level}`);
        }
        return bag || null;
    }
    
    /**
     * 获取所有背包
     * @returns {Array}
     */
    static getBags() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        return this._data.bags.bags;
    }
    
    /**
     * 获取随从职业数据
     * @param {number} jobNo - 职业编号
     * @returns {Object|null}
     */
    static getFollowerJob(jobNo) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const job = this._indexes.followerJobs.get(jobNo);
        if (!job) {
            console.warn(`[DataManager] 未找到FollowerJob: ${jobNo}`);
        }
        return job || null;
    }
    
    /**
     * 获取所有随从职业
     * @returns {Array}
     */
    static getFollowerJobs() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        return this._data.followers.jobs;
    }
    
    /**
     * 获取随从等级数据
     * @param {number} rank - 等级（1-5）
     * @returns {Object|null}
     */
    static getFollowerRank(rank) {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！请先调用init()');
            return null;
        }
        
        const rankData = this._indexes.followerRanks.get(rank);
        if (!rankData) {
            console.warn(`[DataManager] 未找到FollowerRank: ${rank}`);
        }
        return rankData || null;
    }
    
    /**
     * 获取所有随从等级
     * @returns {Array}
     */
    static getFollowerRanks() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return [];
        }
        
        return this._data.followers.ranks;
    }
    
    /**
     * 获取随从配置
     * @returns {Object}
     */
    static getFollowerConfig() {
        if (!this._loaded) {
            console.error('[DataManager] 数据未加载！');
            return {};
        }
        
        return this._data.followers.config;
    }
    
    /**
     * 热重载（调试用）
     * 注意：仅开发环境使用
     */
    static async reload() {
        console.log('[DataManager] 🔄 热重载数据...');
        this._loaded = false;
        this._data = {};
        this._indexes = {};
        await this.init();
    }
    
    /**
     * 导出数据（供工具使用）
     */
    static exportData() {
        return {
            buffs: this._data.buffs,
            relics: this._data.relics,
            equips: this._data.equips,
            materials: this._data.materials,
            mounts: this._data.mounts,
            followers: this._data.followers
        };
    }
    
    /**
     * 获取数据统计信息
     */
    static getStats() {
        if (!this._loaded) {
            return { loaded: false };
        }
        
        return {
            loaded: true,
            buffs: {
                total: this._data.buffs.length,
                debuffs: this._data.buffs.filter(b => b.isDebuff).length,
                items: this._data.buffs.filter(b => b.isItem).length
            },
            relics: {
                total: this._data.relics.length,
                type1: this._data.relics.filter(r => r.type === 1).length,
                type2: this._data.relics.filter(r => r.type === 2).length,
                type3: this._data.relics.filter(r => r.type === 3).length,
                legendary: this._data.relics.filter(r => r.isLegend).length
            },
            equips: {
                weapons: this._data.equips.weapons.length,
                armors: this._data.equips.armors.length,
                legendary: this._data.equips.weapons.filter(w => w.quality === 4).length
            },
            materials: {
                total: this._data.materials.length
            },
            mounts: {
                base: this._data.mounts.baseMounts.length
            },
            bags: this._data.bags.bags.length,
            followers: {
                jobs: this._data.followers.jobs.length,
                ranks: this._data.followers.ranks.length,
                totalSkills: this._data.followers.jobs.reduce((sum, job) => sum + job.skills.length, 0)
            }
        };
    }
}

// 全局访问（便于调试）
window.DataManager = DataManager;

