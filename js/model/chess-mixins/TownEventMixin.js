// 城镇事件系统 Mixin - 住宿、铁匠铺、酒馆、任务、材料捐赠等

const TownEventMixin = {
    // 城镇/村庄事件
    triggeredTownOrVillage(isTown) {
        const placeName = isTown ? '城镇' : '村庄';
        
        if (this.devilDefeated && isTown) {
            this._handleForwardChoice('walk', false);
            return;
        }
        
        if (!this._cell.checkRuinedOver(this.board._round)) {
            this.addChat('这里不久前刚遭遇过怪物侵袭，暂时不欢迎外人入内');
            this._handleForwardChoice('walk', false);
            return;
        }
        
        if (this.checkStayWithSick()) {
            return;
        }
        
        // AS3中没有这行addChat，因为cellReached()中已经显示过"你来到了XXX"
        // 不需要重复显示"到达城镇"信息
        
        this._sellRubbish();
        
        // 优化：使用统一的耐力检查
        if (!this.prop.hasEnoughStamina() && !this.prop.overWeight) {
            this._autoStayHotel(isTown);
            return;
        }
        
        if (this._cell.isFullPopularity()) {
            if (this.marriage && this.marriage.checkMarryWithGal(this, isTown)) {
                return;
            }
        }
        
        // 构建选项
        const options = ['rest'];
        const optionTexts = ['住宿'];
        
        if (isTown) {
            options.push('smith');
            optionTexts.push('锻造');
            
            if (this.prop.stuff > 0 || this.prop.rarestuff > 0) {
                options.push('store');
                optionTexts.push('存放材料');
            }
            
            if (this.board._isNight) {
                options.push('drink');
                optionTexts.push('喝两杯');
            } else {
                options.push('quest');
                optionTexts.push('接受委托');
            }
        } else {
            if (this.prop.stuff > 0 || this.prop.rarestuff > 0) {
                options.push('donate');
                optionTexts.push('捐赠材料');
            }
            
            if (this.board._isNight) {
                options.push('drink');
                optionTexts.push('喝两杯');
            } else {
                options.push('help');
                optionTexts.push('帮忙干活');
            }
        }
        
        // 添加步行选项（离开当前格子）
        options.push('walk');
        optionTexts.push('继续前进');
        
        this.board.chatPanel.addInlineOptions(
            '你打算干什么呢？',
            options,
            optionTexts,
            (choice) => {
                this._handleTownVillageChoice(choice, isTown);
            }
        );
    },
    
    // 处理城镇/村庄选项
    _handleTownVillageChoice(choice, isTown) {
        switch (choice) {
            case 'rest':
                this._stayHotel(isTown);
                break;
            case 'smith':
                this._showSmithMenu();
                break;
            case 'store':
                this._storeMaterials();
                break;
            case 'quest':
                this._findQuest();
                break;
            case 'drink':
                this._drinkAtTavern();
                break;
            case 'donate':
                this._donateMaterials();
                break;
            case 'help':
                this._helpVillage();
                break;
            case 'walk':
                // 直接离开，开始投骰子
                this._handleForwardChoice('walk', false);
                break;
        }
    },
    
    // 售出垃圾
    _sellRubbish() {
        if (this.prop.rubbish > 0) {
            const basePrice = this.prop.rubbish * 10;
            const multiplier = 1 + RandomUtils.randInt(0, 4);  // 优化：使用RandomUtils
            const sellGold = basePrice * multiplier;
            
            this.prop.addGold(sellGold);
            this.addGreenChat(`你卖掉了所有垃圾，金钱+${sellGold}`);
            this.prop.rubbish = 0;
            
            if (this._panel) {
                this._panel.updateUI();
            }
        }
    },
    
    // 耐力不足自动住宿
    _autoStayHotel(isTown) {
        const cost = this._cell.isFullPopularity() ? 0 : 20;
        
        if (this.prop.gold < cost) {
            this.addRedChat('你欲投宿却因身无分文被赶了出来');
            if (this.board._isNight) {
                this.addChat('你又困又累只好去睡了大街');
                this.prop.halfRestoreStamina();  // 只恢复50%耐力
                this._handleForwardChoice('walk', false);
            } else {
                this._handleForwardChoice('walk', false);
            }
            return;
        }
        
        this.addChat('你已疲惫不堪，赶紧找了家客栈住下');
        this._stayHotel(isTown);
    },
    
    // 喝两杯（酒馆）
    _drinkAtTavern() {
        // 🆕 刚复活时不能喝酒（防止刷buff）
        if (this._justRevived) {
            this.addChat('你刚死里逃生，老板看你脸色苍白不肯卖酒给你');
            this._justRevived = false;  // 清除标志
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const cost = 100;
        
        if (this.prop.gold < cost) {
            this.addChat('你本想去酒馆喝两杯可摸摸荷包又放弃了');
            this._handleForwardChoice('walk', false);
            return;
        }
        
        this.addChat(`你去酒馆点了两杯，顺带也吃点豆腐`);
        this.addChat(`金钱-${cost}`);
        this.prop.reduceGold(cost);
        
        const currentRound = this.board._round;
        if (currentRound - this.lastFlag.lastDrinkRound <= 6) {
            this.runningStat.addDrinkCount();
        } else {
            this.runningStat.drinkCount = 1;
        }
        this.lastFlag.lastDrinkRound = currentRound;
        
        if (this.runningStat.drinkCount >= 3) {
            this.runningStat.resetDrinkCount();
            this.addChat('你喝高了对酒馆女郎毛手毛脚，被保镖乱棍轰出');
            
            const reduceType = Math.floor(Math.random() * 3);
            let message = '酗酒过度导致你战斗力下降，';
            
            if (reduceType === 2) {
                message += '攻击-10';
                this.prop.attack = Math.max(0, this.prop.attack - 10);
            } else if (reduceType === 1) {
                message += '防御-5';
                this.prop.defense = Math.max(0, this.prop.defense - 5);
            } else {
                message += '生命-100';
                this.prop.curLife = Math.max(1, this.prop.curLife - 100);
            }
            
            this.addRedChat(message);
            
            if (this._panel) {
                this._panel.updateUI();
            }
            
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const targetTypes = [
            CellType.DOCK, 
            CellType.FAIRYLAND, 
            CellType.DEVILLAND, 
            CellType.SPRING, 
            CellType.STABLE, 
            CellType.CAMP
        ];
        
        const targetCell = this.board.getRandomCell(targetTypes, this._cell.index, 60);
        
        if (!targetCell) {
            const randBuffs = [BuffNo.HIGH_MORALE, BuffNo.BATTLEPOWER, BuffNo.MOVEPOWER];
            const buffNo = RandomUtils.choice(randBuffs);  // 优化：使用RandomUtils.choice
            this.prop.addBuff(buffNo, this.board._round + 1);  // addBuff内部会自动显示提示
            
            if (this._panel) {
                this._panel.updateUI();
            }
            
            this._handleForwardChoice('walk', false);
            return;
        }
        
        let info = '你风趣幽默出手阔绰，很快就逗得酒馆女郎花枝乱颤\n而作为回报，你打听到';
        const rand = Math.random();  // 保留：后续多次判断使用同一随机值
        
        switch(targetCell.cellType) {
            case CellType.DOCK:
                if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 4;
                    targetCell.extraInfo.mustRad = 0.8;
                    info += `有人在${targetCell.cellName}钓鱼时见到了巨大的海怪`;
                } else {
                    targetCell.extraInfo.mustFlag = 5;
                    targetCell.extraInfo.mustRad = 0.8;
                    info += `有人在${targetCell.cellName}钓鱼时钓到了罕见的海产`;
                }
                break;
            
            case CellType.SPRING:
                if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 1;
                    info += `有人在${targetCell.cellName}见到过脱裤魔出没`;
                } else {
                    targetCell.extraInfo.mustFlag = 2;
                    info += `有人在${targetCell.cellName}撞见老铁匠在泡温泉`;
                }
                break;
            
            case CellType.STABLE:
                if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 1;
                    info += `有人在${targetCell.cellName}见到过独眼巨人出没`;
                } else {
                    targetCell.extraInfo.mustFlag = 2;
                    info += `有人在${targetCell.cellName}被盗马的汉子偷走爱驹`;
                }
                break;
            
            case CellType.FAIRYLAND:
                if (targetCell.extraInfo.mustFlag === 6) {
                    info += `有人在${targetCell.cellName}听到震耳欲聋的龙吼`;
                } else if (rand > 0.8) {
                    targetCell.extraInfo.mustFlag = 5;
                    targetCell.extraInfo.mustRad = 0.9;
                    info += `有人在${targetCell.cellName}爬树时见到了猴子`;
                } else if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 4;
                    targetCell.extraInfo.mustRad = 0.8;
                    info += `有人在${targetCell.cellName}考古时听到了神兽的咆哮`;
                } else {
                    targetCell.extraInfo.mustFlag = 3;
                    targetCell.extraInfo.mustRad = 0;
                    info += `有人在${targetCell.cellName}野营时见到了仙女`;
                }
                break;
            
            case CellType.DEVILLAND:
                if (targetCell.extraInfo.mustFlag === 6) {
                    info += `有人在${targetCell.cellName}听到毛骨悚然的哀鸣`;
                } else if (rand > 0.8) {
                    targetCell.extraInfo.mustFlag = 5;
                    targetCell.extraInfo.mustRad = 0.8;
                    info += `有人在${targetCell.cellName}遇到了古代英灵`;
                } else if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 4;
                    targetCell.extraInfo.mustRad = 0.8;
                    info += `有人在${targetCell.cellName}被穷凶极恶的恶魔拍死`;
                } else {
                    targetCell.extraInfo.mustFlag = 3;
                    targetCell.extraInfo.mustRad = 0;
                    info += `有人在${targetCell.cellName}受到女妖诱惑啪啪致死`;
                }
                break;
            
            case CellType.CAMP:
                if (rand > 0.6) {
                    targetCell.extraInfo.mustFlag = 1;
                    info += `有人在${targetCell.cellName}见到过乌鸦王出没`;
                } else {
                    targetCell.extraInfo.mustFlag = 2;
                    info += `有人在${targetCell.cellName}雇到了英雄级随从`;
                }
                break;
        }
        
        targetCell.extraInfo.flagRound = currentRound;
        this.addChat(info);
        
        console.log(`[Chess] 情报打听：在${targetCell.cellName}（索引${targetCell.index}）设置mustFlag=${targetCell.extraInfo.mustFlag}`);
        
        this.finishAction();
    },
    
    // 住宿休息
    _stayHotel(isTown) {
        const cost = this._cell.isFullPopularity() ? 0 : 20;
        
        if (this.prop.gold < cost) {
            this.addChat('你欲投宿却因身无分文被赶了出来');
            if (this.board._isNight) {
                this.addChat('你又困又累只好去睡了大街');
                this.prop.halfRestoreStamina();  // 只恢复50%耐力
                this._handleForwardChoice('walk', false);
            } else {
                this._handleForwardChoice('walk', false);
            }
            return;
        }
        
        if (cost > 0) {
            this.prop.reduceGold(cost);
            this.addChat(`你住进了客栈，金钱-${cost}`);
        } else {
            this.addChat('你在当地声望很高，免费住进了客栈');
        }
        
        this.prop.fullRestore();
        this.addGreenChat('一觉醒来神清气爽，生命和耐力完全恢复！');
        
        this.finishAction();
    },
    
    // 存放材料
    _storeMaterials() {
        this.addChat('老板: 我们可以保管你的材料，每份收费10金');
        const bankStuff = this.prop._bank ? (this.prop._bank[0] || 0) : 0;
        const bankRare = this.prop._bank ? (this.prop._bank[1] || 0) : 0;
        this.addChat(`当前材料 - 普通:${this.prop.stuff}【${bankStuff}】 稀有:${this.prop.rarestuff}【${bankRare}】`);
        
        const totalStuff = this.prop.stuff + this.prop.rarestuff;
        
        if (totalStuff === 0) {
            this.addChat('你没有可存放的材料');
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const storageFee = totalStuff * 10;
        
        if (this.prop.gold < storageFee) {
            this.addChat(`存放费用${storageFee}金，你的钱不够`);
            this._handleForwardChoice('walk', false);
            return;
        }
        
        // 存入银行
        const stuffToStore = this.prop.stuff;
        const rareToStore = this.prop.rarestuff;
        
        this.prop._bank[0] = (this.prop._bank[0] || 0) + stuffToStore;
        this.prop._bank[1] = (this.prop._bank[1] || 0) + rareToStore;
        
        this.prop._stuff = 0;
        this.prop._rarestuff = 0;
        this.prop._updateWeight();
        
        this.prop.reduceGold(storageFee);
        
        this.addGreenChat(`已存放 基础锻材${stuffToStore} 稀有锻材${rareToStore}，费用${storageFee}金`);
        
        this.finishAction();
    },
    
    // 接受委托
    _findQuest() {
        // 🆕 刚复活时不能接任务（防止刷任务）
        if (this._justRevived) {
            this.addChat('你刚死里逃生，现在太虚弱了，无法接受委托');
            this._justRevived = false;  // 清除标志
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const questCount = this.prop.getQuestCount();
        const maxQuests = this.prop._maxQuests || 3;
        
        if (questCount >= maxQuests) {
            this.addChat(`你已经接了${maxQuests}个委托，无法再接更多`);
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const questType = 1 + Math.floor(Math.random() * 4);
        const quest = new Quest(questType);
        
        const isRare = Math.random() > 0.7;
        quest.isRare = isRare;
        
        let targetCell = null;
        switch (questType) {
            case Quest.DELIVER:
                if (isRare) {
                    const targetType = (this._cell.index === 0) ? CellType.CAMP : CellType.STABLE;
                    targetCell = this.board.getNearestCell(this._cell.index, targetType);
                    if (!targetCell) {
                        console.error(`[Quest] 找不到目标格子类型: ${targetType}`);
                        return null;
                    }
                    quest.questDest = targetCell.cellName;
                } else {
                    const types = [CellType.GUILD, CellType.VILLAGE];
                    const targetType = types[Math.floor(Math.random() * types.length)];
                    targetCell = this.board.getNearestCell(this._cell.index, targetType);
                    if (!targetCell) {
                        console.error(`[Quest] 找不到目标格子类型: ${targetType}`);
                        return null;
                    }
                    quest.questDest = `离这最近的${targetCell.cellName}`;
                }
                break;
                
            case Quest.CONVOY:
                if (isRare) {
                    const targetType = (this._cell.index === 0) ? CellType.ARENA : CellType.SPRING;
                    targetCell = this.board.getNearestCell(this._cell.index, targetType);
                    if (!targetCell) {
                        console.error(`[Quest] 找不到目标格子类型: ${targetType}`);
                        return null;
                    }
                    quest.questDest = targetCell.cellName;
                } else {
                    const types = [CellType.DOCK, CellType.VILLAGE, CellType.TOWN];
                    const targetType = types[Math.floor(Math.random() * types.length)];
                    targetCell = this.board.getFarestCell(this._cell.index, targetType);
                    if (!targetCell) {
                        console.error(`[Quest] 找不到目标格子类型: ${targetType}`);
                        return null;
                    }
                    if (this._cell.cellType === targetType) {
                        quest.questDest = `另一个${targetCell.cellName}`;
                    } else {
                        quest.questDest = `离这最远的${targetCell.cellName}`;
                    }
                }
                break;
                
            case Quest.FIND_GOODS:
                quest.replyCellIndex = this._cell.index;
                break;
                
            case Quest.FIND_HUMAN:
                if (isRare) {
                    const targetType = (this._cell.index === 0) ? CellType.FAIRYLAND : CellType.DEVILLAND;
                    targetCell = this.board.getNearestCell(this._cell.index, targetType);
                } else {
                    targetCell = this.board.getRandomCell([CellType.PLAIN, CellType.WOODS, CellType.BEACH]);
                }
                if (!targetCell) {
                    console.error(`[Quest] 找不到搜救任务目标格子`);
                    return null;
                }
                quest.questDest = targetCell.cellName;
                quest.replyCellIndex = this._cell.index;
                break;
        }
        
        if (targetCell) {
            quest.triggerCellIndex = targetCell.index;
            quest.triggerCellType = targetCell.cellType;
            
            // V1.0.6: 根据距离计算合理的任务时限
            // 使用最短距离来计算（环形棋盘可以双向走）
            const distance = this.board.getShortestDistance(this._cell.index, targetCell.index);
            quest.questDuration = this.board.calculateQuestDuration(distance, isRare);
            console.log(`[Quest] 距离${distance}格，时限${quest.questDuration}天（${isRare ? '稀有' : '普通'}）`);
        }
        quest.beginCellIndex = this._cell.index;
        
        quest.initializeByType();
        
        quest.beginRound = this.board._round + 1;
        
        if (this.prop.addQuest(quest)) {
            this.addRedChat(`接受委托：【${quest.questName}】`);
            this.addChat(quest.questIntro);
            if (isRare) {
                this.addChat('这是个稀有委托，回报比一般的要高');
            }
            
            DiaryPanel.getInstance().addDiary(`接受委托：${quest.questName}`);
        } else {
            this.addChat('委托接取失败');
        }
        
        this._handleForwardChoice('walk', false);
    },
    
    // 捐赠材料
    _donateMaterials() {
        const totalStuff = this.prop.stuff + this.prop.rarestuff;
        
        if (totalStuff === 0) {
            this.addChat('你没有可以捐赠的材料');
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const fame = this.prop.stuff * 2 + this.prop.rarestuff * 10;
        
        this.addChat(`村民: 感谢你的捐赠！`);
        this.addChat(`捐出普通材料${this.prop.stuff}个，稀有材料${this.prop.rarestuff}个`);
        this.addGreenChat(`声望+${fame}`);
        
        this.prop.fame += fame;
        this.prop.stuff = 0;
        this.prop.rarestuff = 0;
        
        this.finishAction();
    },
    
    // 帮忙干活
    _helpVillage() {
        // 🆕 刚复活时不能干活（防止刷金钱/经验）
        if (this._justRevived) {
            this.addChat('你刚死里逃生，身体还很虚弱，村民劝你好好休息');
            this._justRevived = false;  // 清除标志
            this._handleForwardChoice('walk', false);
            return;
        }
        
        const staminaCost = Math.floor(this.prop.maxStamina * 0.2);
        
        if (this.prop.curStamina < staminaCost) {
            this.addChat('你的耐力不足以帮忙干活');
            this._handleForwardChoice('walk', false);
            return;
        }
        
        this.prop.consumeStamina(staminaCost);
        
        const expGain = this.prop.level * 2;
        const goldGain = this.prop.level * 10;
        
        this.prop.addExp(expGain);
        this.prop.addGold(goldGain);
        
        this.addChat('村民: 谢谢你的帮忙！');
        this.addGreenChat(`获得${expGain}经验和${goldGain}金钱`);
        
        this.finishAction();
    },
    
    // 显示铁匠铺菜单
    _showSmithMenu() {
        this.addChat('你走进了铁匠铺，里面热气腾腾。铁匠: 需要锻造装备吗？');
        
        const weapon = this.prop.getWeapon();
        const armor = this.prop.getArmor();
        const maxSetNo = this.prop._equips.maxSetNo;
        
        // 显示当前装备信息
        let weaponInfo = '无';
        if (weapon) {
            weaponInfo = weapon.name;
            if (weapon.power > 0) weaponInfo += `+${weapon.power}`;
            const quality = this.prop._getQualityText(weapon.quality);
            weaponInfo += quality;
        }
        
        let armorInfo = '无';
        if (armor) {
            armorInfo = armor.name;
            if (armor.power > 0) armorInfo += `+${armor.power}`;
            const quality = this.prop._getQualityText(armor.quality);
            armorInfo += quality;
        }
        
        this.addChat(`当前武器:${weaponInfo} 护甲:${armorInfo}`);
        this.addChat(`当前背包:${this.prop.getBagName()} 拥有材料 - 普通:${this.prop._stuff} 稀有:${this.prop._rarestuff}`);
        
        // 动态构建选项（满级的选项不显示）
        const choices = [];
        const labels = [];
        
        // 强化武器：有武器且强化未满级(power<9)
        if (weapon && (weapon.power || 0) < 9) {
            choices.push('enhance_weapon');
            labels.push('强化武器(-200金)');
        }
        
        // 强化护甲：有护甲且强化未满级(power<9)
        if (armor && (armor.power || 0) < 9) {
            choices.push('enhance_armor');
            labels.push('强化护甲(-200金)');
        }
        
        // 锻造新武器：有武器且锻造未满级(setNo<maxSetNo)
        if (weapon && weapon.setNo < maxSetNo) {
            choices.push('smith_weapon');
            labels.push('锻造新武器');
        }
        
        // 锻造新护甲：有护甲且锻造未满级(setNo<maxSetNo)
        if (armor && armor.setNo < maxSetNo) {
            choices.push('smith_armor');
            labels.push('锻造新护甲');
        }
        
        // 升级背包：背包未满级
        const bagUpgrade = this.prop.getNextBagUpgradeInfo();
        if (bagUpgrade) {
            choices.push('upgrade_bag');
            labels.push(`升级背包（${bagUpgrade.cost}金）`);
        }
        
        choices.push('walk');
        labels.push('继续前进');
        
        this.board.chatPanel.addInlineOptions(
            '选择锻造项目：',
            choices,
            labels,
            (choice) => {
                this._handleSmithChoice(choice);
            }
        );
    },
    
    // 处理铁匠铺选项
    _handleSmithChoice(choice) {
        switch (choice) {
            case 'enhance_weapon':
                if (this.prop.reduceGold(200)) {
                    const weapon = this.prop.getWeapon();
                    if (this.prop.enhanceWeapon()) {
                        const weaponName = weapon ? weapon.name : '武器';
                        const powerLevel = weapon ? weapon.power : 0;
                        this.addGreenChat(`【${weaponName}】强化到+${powerLevel}！`);
                        if (this._panel) {
                            this._panel.updateUI();
                        }
                    } else {
                        this.addChat('武器已达最大强化等级');
                        this.prop.addGold(200);
                    }
                } else {
                    this.addChat('金钱不够（需要200金币）');
                }
                this._handleForwardChoice('walk', false);
                break;
                
            case 'enhance_armor':
                if (this.prop.reduceGold(200)) {
                    const armor = this.prop.getArmor();
                    if (this.prop.enhanceArmor()) {
                        const armorName = armor ? armor.name : '护甲';
                        const powerLevel = armor ? armor.power : 0;
                        this.addGreenChat(`【${armorName}】强化到+${powerLevel}！`);
                        if (this._panel) {
                            this._panel.updateUI();
                        }
                    } else {
                        this.addChat('护甲已达最大强化等级');
                        this.prop.addGold(200);
                    }
                } else {
                    this.addChat('金钱不够（需要200金币）');
                }
                this._handleForwardChoice('walk', false);
                break;
                
            case 'smith_weapon':
                {
                    const weapon = this.prop.getWeapon();
                    if (!weapon) {
                        this.addChat('你还没有装备武器');
                        this._handleForwardChoice('walk', false);
                        return;
                    }
                    
                    const nextSetNo = weapon.setNo + 1;
                    if (nextSetNo > this.prop._equips.maxSetNo) {
                        this.addChat('你的武器已经是最高级别了');
                        this._handleForwardChoice('walk', false);
                        return;
                    }
                    
                    const required = this.prop._equips.getRequiredStuff(nextSetNo);
                    const successRate = this.prop._equips.getSmithRate(nextSetNo);
                    const nextWeapon = this.prop._equips.getWeapon(nextSetNo);
                    
                    this.addChat(`锻造${nextWeapon.name}需要:`);
                    this.addChat(`普通材料:${required.stuff} 稀有材料:${required.rare}`);
                    this.addChat(`成功率:${(successRate * 100).toFixed(0)}%`);
                    
                    if (this.prop._stuff >= required.stuff && this.prop._rarestuff >= required.rare) {
                        this.prop.smithEquip(true);
                        if (this._panel) {
                            this._panel.updateUI();
                        }
                    } else {
                        this.addChat('材料不足！');
                    }
                }
                this._handleForwardChoice('walk', false);
                break;
                
            case 'smith_armor':
                {
                    const armor = this.prop.getArmor();
                    if (!armor) {
                        this.addChat('你还没有装备护甲');
                        this._handleForwardChoice('walk', false);
                        return;
                    }
                    
                    const nextSetNo = armor.setNo + 1;
                    if (nextSetNo > this.prop._equips.maxSetNo) {
                        this.addChat('你的护甲已经是最高级别了');
                        this._handleForwardChoice('walk', false);
                        return;
                    }
                    
                    const required = this.prop._equips.getRequiredStuff(nextSetNo);
                    const successRate = this.prop._equips.getSmithRate(nextSetNo);
                    const nextArmor = this.prop._equips.getArmor(nextSetNo);
                    
                    this.addChat(`锻造${nextArmor.name}需要:`);
                    this.addChat(`普通材料:${required.stuff} 稀有材料:${required.rare}`);
                    this.addChat(`成功率:${(successRate * 100).toFixed(0)}%`);
                    
                    if (this.prop._stuff >= required.stuff && this.prop._rarestuff >= required.rare) {
                        this.prop.smithEquip(false);
                        if (this._panel) {
                            this._panel.updateUI();
                        }
                    } else {
                        this.addChat('材料不足！');
                    }
                }
                this._handleForwardChoice('walk', false);
                break;
                
            case 'upgrade_bag':
                const bagUpgrade = this.prop.getNextBagUpgradeInfo();
                if (bagUpgrade) {
                    const result = this.prop.upgradeBag();
                    switch (result) {
                        case 0:
                            this.addGreenChat(`背包升级为${this.prop.getBagColorName()}！负重上限+${bagUpgrade.weight}`);
                            this.addChat(`金钱-${bagUpgrade.cost} 普通材料-${bagUpgrade.stuff}`);
                            break;
                        case 2:
                            this.addChat(`金钱不足，需要${bagUpgrade.cost}金`);
                            break;
                        case 3:
                            this.addChat(`材料不足，需要${bagUpgrade.stuff}普通材料`);
                            break;
                        default:
                            this.addChat('背包已是最高级');
                    }
                    if (this._panel) {
                        this._panel.updateUI();
                    }
                }
                this._handleForwardChoice('walk', false);
                break;
                
            case 'walk':
                // 直接离开，开始投骰子
                this._handleForwardChoice('walk', false);
                break;
        }
    }
};

