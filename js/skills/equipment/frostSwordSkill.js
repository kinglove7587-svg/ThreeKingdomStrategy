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
    onBeforeDamage(player, damage){
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
        // ถามผู้ใช้ว่าต้องการเปิดใช้สกิลหรือไม่
        player.controller.startTriggerChoice(this, 
            {
                damage: damage
            }
        );
    }
    // จัดการคำตอบ [ใช้ / ไม่ใช้] จากผู้เล่น
    resolveChoice(player, game, context, useSkill){

        if(!context || !context.damage){
            return false;
        }

        if(useSkill){
            // ยกเลิก Damage และ Resume กระบวนการ
            context.damage.waitingTrigger = false;
            context.damage.canceled = true;
            game.log(player.name + " เลือกใช้ กระบี่น้ำแข็ง");
            return context.damage.resume();

        }else{
            // ดำเนินการ Damage ต่อตามปกติ
            game.log(player.name + " ไม่ใช้ กระบี่น้ำแข็ง");
            context.damage.waitingTrigger = false;
            return context.damage.resume();
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
                !player.hand.cards.includes(selection.card)
            ){
                return false;
            }
            if(
                selection.source === "weapon" && 
                player.weapon !== selection.card
            ){
                return false;
            }
            if(
                selection.source === "armor" && 
                player.armor !== selection.card
            ){
                return false;
            }
            if(
                selection.source === "mount" && 
                player.mount !== selection.card
            ){
                return false;
            }
        }
        // เริ่มดำเนินการถอดการ์ดออกและทิ้งลง discardPile
        for(const selection of selections){

            let removeCard = null;
            if(selection.source === "hand"){
                const index = player.hand.cards.indexOf(selection.card);

                if(index === -1){
                    return false;
                }
                removeCard = player.hand.removeCard(index);
            }

            if(selection.source === "weapon"){
                removeCard = player.unequipWeapon();
            }

            if(selection.source === "armor"){
                removeCard = player.unequipArmor();
            }

            if(selection.source === "mount"){
                removeCard = player.unequipMount();
            }

            if(!removeCard){
                return false;
            }

            game.discardPile.addCard(removeCard);
            game.log(player.name + " ทิ้ง " + removeCard.name + " จาก " + 
                selection.source + " ด้วย กระบี่น้ำแข็ง"
            );
        }
        return true;
    }
}