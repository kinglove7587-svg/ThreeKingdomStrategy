class SlashCard extends BasicCard{ 
    //
    constructor(suit, number, damageType = DamageType.NORMAL){
        super("Basic", "โจมตี", suit, number); 
        this.damageType = damageType; // กำหนดประเภทความเสียหายของการ์ดโจมตี
    }
    // Override ความสามารถของการ์ด
    use(player, game){ 
        // สร้าง Context สำหรับเช็กเงื่อนไขการใช้การ์ดโจมตี
        const context = {
            player : player, 
            allow : player.canUseSlash()
        };
        // ส่ง Event ก่อนใช้การ์ดโจมตี เปิดโอกาสให้ Trigger Skill
        game.eventManager.emit("beforeUseSlash", context);
        console.log("allow =", context.allow);
        // ตรวจสอบสิทธิ์การใช้งานจาก context.allow
        if (!context.allow){
            // หากใช้ไปแล้ว ให้แสดงข้อความแจ้งเตือนใน Console
            game.log(player.name + " ใช้โจมตีไปแล้ว ");
            // ไม่อนุญาตให้ใช้งานการ์ด ส่งค่า false กลับออกไป
            return false;
        }
        // ดึงผู้เล่นเป้าหมายจาก Controller ของผู้เล่นผ่านเมธอด getTarget() แบบ Polymorphism
        const target = player.controller.getTarget(this);
        // ถ้ายังไม่ได้เลือกเป้าหมาย ให้แสดงข้อความแจ้งเตือนและยกเลิกการใช้การ์ด
        if (target === null){
            console.log("ยังไม่ได้เลือกเป้าหมาย");
            return false;
        }
        // บันทึกสถานะว่าผู้เล่นคนนี้ได้ใช้งานการ์ดโจมตีเรียบร้อยแล้ว (ผ่านเมธอด markSlashUsed)
        player.markSlashUsed();
        // สร้าง Context สำหรับระบบประมวลผลการหลบ (เก็บผู้โจมตี, เป้าหมาย, และสถานะการหลบ)
        const dodgeContext = {
            attacker: player, 
            target: target, 
            dodge: false
        };
        // แสดงชื่อตามประเภทการ์ด เช่น โจมตี / โจมตีไฟ / โจมตีสายฟ้า
        game.log("→ เป้าหมาย : " + target.name); 
        // เปิดโอกาสให้สกิลต่างๆ แทรกการทำงานก่อนตรวจสอบการ์ดหลบ
        game.eventManager.emit("beforeDodge", dodgeContext);
        // สร้าง Context ของ Slash ก่อนตรวจสอบผลการหลบ
        const slashContext = {
            source: player, 
            target: target, 
            card: this, 
            canceled: false
        };
        // ตรวจสอบเงื่อนไขการหลบจากสกิลก่อนเป็นอันดับแรก
        if (dodgeContext.dodge){
            game.log(target.name + " หลบการโจมตี"); 
        // หากไม่ได้หลบด้วยสกิล ให้ตรวจสอบการ์ดหลบในมือต่อ
        }else if(game.askDodge(target)){
            slashContext.canceled = true;
        }else{
            console.log(target.name + " ไม่มีการ์ดหลบ "); // แจ้งว่าหลบไม่ได้
        }
        // ส่ง Event ก่อนการโจมตีโดนเป้าหมาย
        game.eventManager.emit("beforeSlashHit", slashContext);
        // เก็บขั้นตอนหลัง Trigger ไว้เพื่อให้ Slash เดิมกลับมาทำงานต่อได้
        slashContext.resume = () => {
            // หากมีการยกเลิกการโจมตี
            if (slashContext.canceled){
                game.log(target.name + " ป้องกันการโจมตี");
                return true;
            }
            console.log("Slash DamageType =", this.damageType);// Debug
            // กำหนดค่าความเสียหายพื้นฐานของการ์ดโจมตีเริ่มต้นที่ 1
            let damageAmount = 1;
            // ตรวจสอบว่าผู้เล่นกำลังอยู่ในสถานะเมาสุราหรือไม่
            if(player.isDrunk()){
                // หากเมาสุรา ให้เพิ่มค่าความเสียหายขึ้นอีก 1 (รวมเป็น 2)
                damageAmount++;
                // รีเซ็ตสถานะเมาสุราของผู้เล่นกลับเป็น false ทันที เพื่อไม่ให้ผลติดไปในการโจมตีครั้งถัดไป
                player.setDrunk(false);
                game.log(player.name + " ได้รับผลของสุรา ความเสียหาย +1");
            }
            // สร้าง Object ความเสียหาย (Damage) โดยส่งตัวละครผู้โจมตี, เป้าหมาย, จำนวนความเสียหายที่คำนวณได้ และประเภทความเสียหาย
            const damage = new Damage(player, target, damageAmount, this.damageType);
            // บันทึกว่าดาเมจนี้เกิดจากการ์ดใบไหน
            damage.card = this;
            // ส่งออบเจกต์ความเสียหายให้ Game เป็นศูนย์กลางประมวลผล
            game.damage(damage);
            console.log(player.isDrunk());

            return true;
        };
        // ถ้ามี Trigger รอการตัดสินใจ ให้หยุด Slash ไว้ก่อน
        if(slashContext.waitingTrigger){
            return true;
        }
        return slashContext.resume();
        
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