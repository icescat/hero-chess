/**
 * 坐骑类
 * 对应 AS3: csh.model.Mount
 * 
 * 功能：
 * 1. 坐骑等级系统（1-16级）
 * 2. 坐骑属性（攻击、负重、耐力消耗减少）
 * 3. 坐骑成长系统（成长度100升级到下一代）
 * 4. 特殊坐骑（幽冥战马）
 */

class Mount {
    // 坐骑编号常量
    static maxNormalNo = 15;     // 最大普通坐骑编号
    static uniqueNo = 16;        // 幽冥战马编号
    
    /**
     * 构造函数
     * @param {number} mountNo 坐骑编号
     */
    constructor(mountNo) {
        this.mountNo = mountNo;
        
        // 基础属性
        this.name = '';                    // 坐骑名称
        this.colorName = '';               // 带颜色的名称
        this.attack = 0;                   // 攻击力加成
        this.weight = 0;                   // 负重加成
        this.staConsumeReduce = 0;         // 耐力消耗减少
        
        // 成长系统
        this.growth = 0;                   // 成长度（0-100）
        this.growrate = 0;                 // 成长率
        
        // 描述
        this.description = '';             // 马匹外形描述
        
        // 费用
        this.improveFee = 0;               // 升级费用
        
        // 特殊属性
        this._canWaterRun = false;         // 是否可踏水
        
        this.initialize();
    }
    
    /**
     * 获取总攻击力
     */
    get totalAttack() {
        return this.attack;
    }
    
    /**
     * 获取总负重
     */
    get totalWeight() {
        return this.weight;
    }
    
    /**
     * 初始化坐骑属性（数据驱动）
     */
    initialize() {
        // ✅ 从JSON数据库加载基础坐骑数据
        const baseMount = DataManager.getMount(this.mountNo);
        
        if (baseMount) {
            // 基础坐骑（1-5, 16）
            this.name = baseMount.name;
            this.colorName = `【${this.name}】`;
            this.attack = baseMount.attack;
            this.weight = baseMount.weight;
            this.staConsumeReduce = baseMount.staConsumeReduce;
            this.growrate = baseMount.growrate;
            this.description = baseMount.description || '';
            this._canWaterRun = baseMount.canWaterRun || false;
            
            console.log(`[Mount] ✓ 坐骑初始化（数据驱动）: ${this.name}`);
        } 
        // 完美的马的多代（6-15）
        else if (this.mountNo > 5 && this.mountNo <= Mount.maxNormalNo) {
            const config = DataManager.getAdvancedMounts().perfectHorse;
            if (config) {
                const generation = this.mountNo - config.baseNo;
                if (this.mountNo < Mount.maxNormalNo) {
                    this.name = `${config.baseName}${generation + 1}代`;
                } else {
                    this.name = config.finalName;
                }
                this.colorName = `【${this.name}】`;
                this.attack = config.baseAttack + generation * config.attackPerGen;
                this.weight = config.baseWeight + generation * config.weightPerGen;
                this.staConsumeReduce = config.staConsumeReduce;
                this.growrate = config.growrate;
                this.description = config.description || '';
                
                console.log(`[Mount] ✓ 坐骑初始化（数据驱动-多代）: ${this.name}`);
            } else {
                console.error(`[Mount] ❌ 未找到高级坐骑配置: perfectHorse`);
            }
        } 
        // 幽冥战马的多代（17+）
        else if (this.mountNo > Mount.uniqueNo) {
            const config = DataManager.getAdvancedMounts().netherSteed;
            if (config) {
                const generation = this.mountNo - config.baseNo;
                this.name = `${config.baseName}${generation + 1}代`;
                this.colorName = `【${this.name}】`;
                this.attack = config.baseAttack + generation * config.attackPerGen;
                this.weight = config.baseWeight + generation * config.weightPerGen;
                this.staConsumeReduce = config.staConsumeReduce;
                this.growrate = config.growrate;
                this.description = config.description || '';
                this._canWaterRun = config.canWaterRun || false;
                
                console.log(`[Mount] ✓ 坐骑初始化（数据驱动-幽冥多代）: ${this.name}`);
            } else {
                console.error(`[Mount] ❌ 未找到高级坐骑配置: netherSteed`);
            }
        }
        else {
            console.error(`[Mount] ❌ 未找到坐骑数据: mountNo=${this.mountNo}`);
            this.name = '未知坐骑';
            this.colorName = `【${this.name}】`;
        }
        
        // 计算升级费用
        this.improveFee = this.mountNo * this.mountNo * 2000;
    }
    
    /**
     * 坐骑成长
     * @param {boolean} forced 是否强制成长
     * @returns {boolean} 是否成长
     */
    grow(forced = false) {
        if (this.mountNo === Mount.maxNormalNo) {
            return false; // 终代无法成长
        }
        
        if (this.growth < 100) {
            if (forced || RandomUtils.chance(this.growrate)) {
                let growthIncrease = 10;
                if (forced) {
                    growthIncrease = RandomUtils.randInt(10, 20);
                }
                this.growth = Math.min(100, this.growth + growthIncrease);
                console.log(`[Mount] 坐骑成长: ${this.name} +${growthIncrease} (${this.growth}/100)`);
                return true;
            }
        }
        return false;
    }
    
    /**
     * 是否可以升级
     */
    canImprove() {
        return this.growth >= 100 && this.mountNo !== Mount.maxNormalNo;
    }
    
    /**
     * 是否可以成长
     */
    canGrow() {
        return this.mountNo !== Mount.maxNormalNo;
    }
    
    /**
     * 获取下一代坐骑
     * @returns {Mount}
     */
    getNextGeneration() {
        const nextNo = this.mountNo !== Mount.maxNormalNo ? this.mountNo + 1 : this.mountNo;
        const nextMount = new Mount(nextNo);
        console.log(`[Mount] 坐骑升级: ${this.name} → ${nextMount.name}`);
        return nextMount;
    }
    
    /**
     * 是否可以踏水而行
     */
    canWaterRun() {
        return this._canWaterRun || this.mountNo >= Mount.uniqueNo;
    }
    
    /**
     * 坐骑比赛（测试排名）
     * @returns {number} 排名（1=最好）
     */
    testRace() {
        const maxRank = 10;
        const winRate = Math.min(0.5, this.mountNo * 0.03);
        
        if (RandomUtils.chance(winRate)) {
            return 1; // 第一名
        }
        
        const rank = maxRank - RandomUtils.randInt(this.mountNo, this.mountNo + maxRank - 1) + 1;
        
        if (rank > maxRank) {
            return 0;
        } else if (rank <= 0) {
            return 1;
        }
        
        return rank;
    }
    
    /**
     * 打印坐骑信息
     * @returns {string}
     */
    printMount() {
        let info = '';
        
        // 名称
        info += `${this.colorName}<br>`;
        
        // 成长度（完美马不显示）
        if (this.mountNo < Mount.maxNormalNo) {
            info += `成长度 ${this.growth}/100<br>`;
        }
        
        // 攻击力
        info += `攻击 +${this.attack}<br>`;
        
        // 负重
        info += `负重 +${this.weight}<br>`;
        
        // 耐力消耗
        info += `骑行耐力消耗 -${this.staConsumeReduce}<br>`;
        
        // 特殊能力（幽冥战马）
        if (this.canWaterRun()) {
            info += '※可奔行于水面<br>';
        }
        
        // 马匹描述（从JSON读取）
        if (this.description) {
            info += `<br><font color='#AAAAAA'>${this.description}</font>`;
        }
        
        return info;
    }
    
    /**
     * 获取存档数据
     * @returns {Object}
     */
    getRecord() {
        return {
            mountNo: this.mountNo,
            growth: this.growth
        };
    }
    
    /**
     * 从存档恢复坐骑
     * @param {Object} record 存档数据
     * @returns {Mount}
     */
    static getMountByRecord(record) {
        const mount = new Mount(record.mountNo);
        mount.growth = record.growth || 0;
        return mount;
    }
    
    /**
     * 获取幽冥战马
     * @returns {Mount}
     */
    static getUniqueMount() {
        return new Mount(Mount.uniqueNo);
    }
}

