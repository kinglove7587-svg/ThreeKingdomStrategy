class GreenDragonBladeSkill extends TriggerSkill{
    // GreenDragonBladeSkill (สกิลผูกง้าวมังกรเขียว)
    constructor(){
        super("ง้าวมังกรเขียว");
    }
    // ลงทะเบียนฟัง Event หลังจากการตรวจ Dodge ของการ์ด Slash
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeSlashHit", 
            this.onBeforeSlashHit.bind(this, player)
        );
    }
    // ตรวจสอบว่า Slash ของผู้สวมอาวุธนี้ถูกหลบหรือไม่
    onBeforeSlashHit(player, context){

        if(!context.canceled){
            return;
        }

        if(context.source !== player){
            return;
        }
        console.log(
            player.name + " ง้าวมังกรเขียว: Slash ถูกหลบโดย " +
            context.target.name
        );
        // หยุด Slash เดิมไว้ก่อน เพื่อรอการตัดสินใจใช้ Trigger Choice
        context.waitingTrigger = true;
        // เรียก Controller เริ่มถามผู้เล่นว่าจะใช้ความสามารถง้าวมังกรเขียวหรือไม่
        player.controller.startTriggerChoice(this, 
            {
                slashContext: context
            }
        );
        
    }
    // ประมวลผลเมื่อผู้เล่นเลือก [ใช้] หรือ [ไม่ใช้]
    resolveChoice(player, game, context, useSkill){

        const slashContext = context.slashContext;
        if(!useSkill){
            slashContext.waitingTrigger = false;
            game.log(player.name + " ไม่ใช้ ง้าวมังกรเขียว");
            return slashContext.resume();
        }
        // กรณีเลือกใช้ 
        slashContext.waitingTrigger = false;
        game.log(player.name + " ใช้ ง้าวมังกรเขียว");
        return true;
    }
}