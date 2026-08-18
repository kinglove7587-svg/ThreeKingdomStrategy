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
}