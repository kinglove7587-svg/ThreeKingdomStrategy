class FeatheredFanSkill extends TriggerSkill{
    // สกิลของอาวุธพัดขนนก (Feathered Fan)
    constructor(){
        super("พัดขนนก");
    }
    // ลงทะเบียน Event Listener ดักฟังก่อนใช้งาน Slash
    register(eventManager, player){

        this.registerListener(
            eventManager, 
            "beforeUseSlash", 
            this.onBeforeUseSlash.bind(this, player)
        );
    }
    // ดักจับการโจมตีแล้วถามผู้เล่นว่าจะแปลงเป็นโจมตีไฟหรือไม่
    onBeforeUseSlash(player, context){
        // ทำงานเฉพาะตอนผู้เล่นเจ้าของสกิลกำลังใช้ โจมตี
        if(context.player !== player){
            return;
        }
        // Human ให้ผู้เล่นตัดสินใจเอง
        if(player.controller instanceof HumanController){

            context.waitingTriggerChoice = true;
            player.controller.startTriggerChoice(this, 
                {
                    slashContext: context
                }
            );
            return;
        }
        // todo AI ยังใช้ Slash ปกติไปก่อน
    }
    // ประมวลผลผลลัพธ์จากการตัดสินใจของผู้เล่น
    resolveChoice(player, game, context, useSkill){
        
        const slashContext = context.slashContext;
        if(!slashContext){
            return false;
        }
        // หากผู้เล่นกดไม่ใช้
        if(!useSkill){
            slashContext.waitingTriggerChoice = false;
            game.log(player.name + " ไม่ใช้ พัดขนนก");
            return slashContext.resume();
        }
        // กำหนดประเภทความเสียหายของการโจมตีครั้งนี้เป็น FIRE
        slashContext.damageType = DamageType.FIRE;
        
        slashContext.waitingTriggerChoice = false;
        game.log(player.name + " ใช้ พัดขนนก เปลี่ยนเป็น โจมตีไฟ");
        return slashContext.resume();
    }
}