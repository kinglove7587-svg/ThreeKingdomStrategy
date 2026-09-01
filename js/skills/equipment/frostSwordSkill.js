class FrostSwordSkill extends TriggerSkill{
    
    constructor(){
        super("กระบี่น้ำแข็ง");
    }
    // ลงทะเบียนฟัง Event beforeDamage
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeDamage", 
            this.onBeforeDamage.bind(this, player)
        );
    }
    // ตรวจสอบเงื่อนไขก่อนเกิดความเสียหาย
    onBeforeDamage(player, damage, resolution){
        // ต้องเป็น Damage ที่เกิดจากเจ้าของกระบี่น้ำแข็งเท่านั้น
        if(damage.source !== player){
            return;
        }
        // ต้องเกิดจากการ์ดประเภท SlashCard เท่านั้น
        if(!(damage.card instanceof SlashCard)){
            return;
        }
        console.log(player.name + " กระบี่น้ำแข็ง: Slash สร้าง Damage ให้ " + damage.target.name);
        // กำหนดให้ Damage หยุดรอคำตอบจากผู้เล่น
        damage.waitingTrigger = true;
        if(resolution){
            resolution.wait();
        }
        // ถามผู้ใช้ว่าต้องการเปิดใช้สกิลหรือไม่
        player.controller.startTriggerChoice(this, 
            {
                damage: damage, 
                resolution: resolution
            }
        );
    }
    // นับจำนวนการ์ดทั้งหมดของเป้าหมาย (มือ + อาวุธ + เกราะ + ม้า)
    countFrostSwordCards(target){

        let count = 0;
        // นับจำนวนไพ่บนมือ
        count += target.hand.cards.length;
        // นับอุปกรณ์: อาวุธ
        if(target.weapon){
            count++;
        }
        // นับอุปกรณ์: เกราะ
        if(target.armor){
            count++;
        }
        // นับอุปกรณ์: ม้า
        if(target.mount){
            count++;
        }
        return count;
    }
    // จัดการคำตอบ [ใช้ / ไม่ใช้] จากผู้เล่น
    resolveChoice(player, game, context, useSkill){

        if(!context || !context.damage){
            return false;
        }

        if(useSkill){
            // นับจำนวนการ์ดที่สามารถทิ้งได้
            const target = context.damage.target;
            // นับจำนวนการ์ดที่สามารถทิ้งได้
            const availableCount = this.countFrostSwordCards(target);
            // กรณีการ์ดไม่ถึง 2 ใบ (ใช้สกิลไม่ได้ -> ทำ Damage ต่อตามปกติ)
            if(availableCount < 2){
                // ยกเลิก Damage และ Resume กระบวนการ
                context.damage.waitingTrigger = false;
                context.damage.canceled = false;
                game.log(player.name + " ไม่สามารถใช้ กระบี่น้ำแข็งได้ เพราะมีการ์ดให้ทิ้งไม่ถึง 2 ใบ");
                if(context.resolution){
                    context.resolution.resume();
                }
                return true;
            }
            // กรณีการ์ดตั้งแต่ 2 ใบขึ้นไป (ใช้สกิลสำเร็จ -> ยกเลิก Damage แล้วเข้าสู่หน้าเลือกการ์ด 2 ใบ)
            context.damage.canceled = true;
            game.log(player.name + " เลือกใช้ กระบี่น้ำแข็ง");
            player.controller.startFrostSwordCardSelection(this, context);
            return true;

        }else{
            // กรณีไม่ใช้สกิล -> ดำเนินการ Damage ต่อตามปกติ
            game.log(player.name + " ไม่ใช้ กระบี่น้ำแข็ง");
            player.controller.selectedTriggerSkill = null;
            player.controller.triggerContext = null;
            player.controller.inputState = "idle";
            context.damage.waitingTrigger = false;
            context.damage.resume();
            return true;
        }
    }
    // ตรวจสอบการ์ดที่เลือกทิ้ง 2 ใบ นำออกจากมือ/ช่องอุปกรณ์ แล้วส่งเข้า discardPile
    resolveFrostSwordCards(player, game, context){

        if(!context){
            return false;
        }

        if(!player.controller){
            return false;
        }
        // ดึงตัวละครเป้าหมายที่จะโดนทิ้งการ์ด
        const target = context.damage.target;
        // ตรวจสอบว่าผู้เล่นเลือกการ์ดทิ้งครบ 2 ใบหรือไม่
        const selections = player.controller.selectedFrostSwordCards;
        if(!selections || selections.length !== 2){
            return false;
        }
        // ตรวจสอบความถูกต้องของการ์ดทั้ง 2 ใบก่อนลบ
        for(const selection of selections){
            if(!selection.card){
                return false;
            }
            if(
                selection.source === "hand" && 
                !target.hand.cards.includes(selection.card)
            ){
                return false;
            }
            if(
                selection.source === "weapon" && 
                target.weapon !== selection.card
            ){
                return false;
            }
            if(
                selection.source === "armor" && 
                target.armor !== selection.card
            ){
                return false;
            }
            if(
                selection.source === "mount" && 
                target.mount !== selection.card
            ){
                return false;
            }
        }
        // เริ่มดำเนินการถอดการ์ดออกและทิ้งลง discardPile
        for(const selection of selections){

            let removeCard = null;
            if(selection.source === "hand"){
                const index = target.hand.cards.indexOf(selection.card);

                if(index === -1){
                    return false;
                }
                removeCard = target.hand.removeCard(index);
            }

            if(selection.source === "weapon"){
                removeCard = target.unequipWeapon();
            }

            if(selection.source === "armor"){
                removeCard = target.unequipArmor();
            }

            if(selection.source === "mount"){
                removeCard = target.unequipMount();
            }

            if(!removeCard){
                return false;
            }

            game.discardPile.addCard(removeCard);
            game.log(target.name + " ทิ้ง " + removeCard.name + " จาก " + 
                selection.source + " ด้วย กระบี่น้ำแข็ง"
            );
        }
        // เคลียร์ State และ Resume Damage
        player.controller.selectedFrostSwordCards = [];
        context.damage.waitingTrigger = false;
        context.damage.resume();
        return true;
    }
}