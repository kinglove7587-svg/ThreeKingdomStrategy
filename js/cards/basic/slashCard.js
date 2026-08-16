class SlashCard extends BasicCard{ 
    //
    constructor(suit, number, damageType = DamageType.NORMAL){
        super("Basic", "โจมตี", suit, number); 
        this.damageType = damageType; // กำหนดประเภทความเสียหายของการ์ดโจมตี
    }
    // ประมวลผลการใช้การ์ดโจมตี (SlashCard)
    use(player, game){ 
        // สร้าง Context สำหรับเช็กเงื่อนไขการใช้การ์ดโจมตี
        const context = {
            player: player, 
            card: this, 
            allow: player.canUseSlash(), 
            skyPiercingHalberdActive: false, 
            waitingTriggerChoice: false, 
            damageType: this.damageType
        };
        // ฟังก์ชัน callback สำหรับรัน Flow การโจมตีต่อหลังผ่าน Trigger
        context.resume = () => {
            console.log(player.name + " Resume Slash หลัง Trigger");
            // ตรวจสอบสิทธิ์การใช้ Slash
            if(!context.allow){
                game.log(player.name + " ใช้โจมตีไปแล้ว ");
                return false;
            }
            // ดึงเป้าหมายที่เลือก
            const target = player.controller.getTarget(this);
            if(target === null){
                console.log("ยังไม่ได้เลือกเป้าหมาย");
                return false
                
            }
            // สร้าง Context หลังเลือกเป้าหมาย
            const targetContext = {
                player: player, 
                card: this, 
                primaryTarget: target, 
                skyPiercingHalberdActive: context.skyPiercingHalberdActive, 
                waitingAdditionalTargets: false, 
                ignoreArmor: false, 
                damageType: context.damageType
            };
            // ส่ง Event ตรวจสอบเป้าหมาย
            game.eventManager.emit("beforeSlashTarget", targetContext);
            // ถ้ามีการรอเลือกเป้าหมายเพิ่ม
            if(targetContext.waitingAdditionalTargets){
                return true;
            }
            // ทำเครื่องหมายว่าใช้ Slash ไปแล้วในรอบนี้
            player.markSlashUsed();
            // ประมวลผลเป้าหมายหลัก
            return this.resolveSlashTarget(player, target, game, targetContext);
            
        };
        // ส่ง Event ก่อนใช้การ์ดโจมตี เปิดโอกาสให้ Trigger Skill
        game.eventManager.emit("beforeUseSlash", context);
        console.log("allow =", context.allow);
        // ถ้า Trigger ขอหยุดรอการตัดสินใจของผู้เล่น (Trigger Choice) ให้หยุดรอ
        if(context.waitingTriggerChoice){
            return true;
        }
        // ดำเนินการ Slash ต่อทันที
        return context.resume();
    }
    // ประมวลผลการใช้ Slash ต่อ 1 เป้าหมาย (เช็กหลบ -> emit beforeSlashHit -> ทำความเสียหาย)
    resolveSlashTarget(player, target, game, targetContext = null){
        
        game.log("→ เป้าหมาย : " + target.name);
        // เปิดโอกาสให้ Skill แทรกก่อน Dodge
        const dodgeContext = {
            attacker: player, 
            target: target, 
            dodge: false, 
            ignoreArmor: targetContext ? targetContext.ignoreArmor : false
        };
        game.eventManager.emit("beforeDodge", dodgeContext);
        // สร้าง Context ของ Slash ก่อนโดนเป้าหมาย
        const slashContext = {
            source: player, 
            target: target, 
            card: this, 
            canceled: false, 
            ignoreArmor: targetContext ? targetContext.ignoreArmor : false, 
            damageType: targetContext ? targetContext.damageType : this.damageType
        };
        // ตรวจสอบการหลบจาก Skill หรือการ์ดหลบ
        if(dodgeContext.dodge){
            game.log(target.name + " หลบการโจมตี");

        }else if(game.askDodge(target)){
            slashContext.canceled = true;
        }else{

            console.log(target.name + " ไม่มีการ์ดหลบ ");
        }
        // Event ก่อนการโจมตีโดน
        game.eventManager.emit("beforeSlahHit", slashContext);
        // กำหนดวิธี Resume หลัง Trigger
        slashContext.resume = () => {
            if(slashContext.canceled){
                game.log(target.name + " ป้องกันการโจมตี");
                return true;
            }
            console.log("Slash DamageType =", slashContext.damageType);
            // Damage เริ่มต้น
            let damageAmount = 1;
            // ผลของสุรา
            if(player.isDrunk()){
                damageAmount++;
                player.setDrunk(false);
                game.log(player.name + " ได้รับผลของสุรา ความเสียหาย +1");
            }
            // สร้าง Damage และบันทึกการ์ดต้นทาง
            const damage = new Damage(player, target, damageAmount, slashContext.damageType);
            damage.card = this;
            damage.ignoreArmor = slashContext.ignoreArmor;
            // ส่ง Damage เข้าระบบ
            game.damage(damage);
            console.log(player.isDrunk());
            return true;
        };
        // ถ้ามี Trigger รอ Resume
        if(slashContext.waitingTrigger){
            return true;
        }
        return slashContext.resume();
    }
    // ใช้สำหรับ Multi-target แต่ยังไม่ผูกเข้ากับ Flow จริง
    resolveSlashTargets(player, targets, game){
        // ตรวจสอบว่า targets เป็น Array หรือไม่
        if(!Array.isArray(targets)){
            return false;
        }
        // หากไม่มีเป้าหมายให้ คืนค่า true
        if(targets.length === 0){
            return true;
        }
        console.log(
            "Resolve Slash Targets", 
            targets.map(target => target.name)
        );
        // วนลูปประมวลผลเป้าหมายทีละคน
        for(let i = 0; i < targets.length; i++){
            
            const target = targets[i];
            if(!target){
                continue;
            }
            console.log("กำลังประมวลผลเป้าหมายลำดับ", i, target.name);
            // ส่งเป้าหมายเข้าเมธอดประมวลผลเดี่ยว
            const success = this.resolveSlashTarget(player, target, game);
            if(!success){
                return false;
            }
        }
        return true;
    }
    // การ์ดใบนี้จำเป็นต้องเลือกเป้าหมายก่อนใช้งาน (เช่น การ์ด โจมตี / Slash)
    needTarget(){
        return true;
    }
    // ตรวจสอบว่าสามารถเลือกผู้เล่นคนนี้เป็นเป้าหมายของการ์ด "โจมตี" ได้หรือไม่
    canTarget(player, target){
        // เงื่อนไขที่ 1: ห้ามเลือกตัวเองเป็นเป้าหมาย
        if (player === target){
            return false;
        }
        // เงื่อนไขที่ 2: คำนวณระยะห่างระหว่างผู้ใช้การ์ดกับเป้าหมายผ่านระบบ Distance ของเกม
        const distance = player.game.getAttackDistance(player, target);
        // เงื่อนไขที่ 3: ถ้าระยะห่างจริง ไกลกว่าระยะการโจมตีจากอาวุธที่ผู้เล่นถืออยู่ จะไม่สามารถตกเป็นเป้าหมายได้
        if (distance > player.getWeaponRange()){
            return false;
        }
        return true;
    }
    // คืนค่าชื่อการ์ดสำหรับแสดงผล ตามประเภทความเสียหาย
    getName(){
        // ตรวจสอบประเภทความเสียหายของการ์ด
        switch(this.damageType){
            // กรณีความเสียหายธาตุไฟ
            case DamageType.FIRE:
                return "โจมตีไฟ";
            // กรณีความเสียหายธาตุสายฟ้า
            case DamageType.THUNDER:
                return "โจมตีสายฟ้า";
            // กรณีความเสียหายปกติ คืนค่าชื่อการ์ดตั้งต้น (โจมตี)
            default:
                return this.name;
        }
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){

        switch(this.damageType){
            case DamageType.FIRE: 
                return "สร้างความเสียหายไฟ 1 ให้เป้าหมาย";
            case DamageType.THUNDER: 
                return "สร้างความเสียหายสายฟ้า 1 ให้เป้าหมาย";
            default: 
                return "สร้างความเสียหายปกติ 1 ให้เป้าหมาย";
        }
    }
}