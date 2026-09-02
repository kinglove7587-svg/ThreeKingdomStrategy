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
         console.log(
            "[DEBUG GreenDragon] beforeSlashHit",
            context.canceled,
            context.source?.name,
            context.target?.name
        ); 

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
        console.log(
            "[DEBUG GreenDragon] Trigger ผ่าน → เปิดหน้าต่างเลือก"
        );
        // เรียก Controller เริ่มถามผู้เล่นว่าจะใช้ความสามารถง้าวมังกรเขียวหรือไม่
        player.controller.startTriggerChoice(this, 
            {
                slashContext: context
            }
        );
        
    }
    // ประมวลผลเมื่อผู้เล่นเลือก [ใช้] หรือ [ไม่ใช้]
    resolveChoice(player, game, context, useSkill){

        const controller = player.controller;
        const slashContext = context.slashContext;
        // กรณีไม่ใช้ความสามารถ
        if(!useSkill){
            slashContext.waitingTrigger = false;
            game.log(player.name + " ไม่ใช้ ง้าวมังกรเขียว");
            // จบ Trigger ปัจจุบันก่อน Resume Slash เดิม
            controller.inputState = "idle";
            controller.selectedTriggerSkill = null;
            controller.triggerContext = null;
            return slashContext.resume();
        }
        // ค้นหาการ์ดโจมตีใบใหม่ในมือ
        const slashCards = player.hand.findSlashCards();
        // กรณีไม่มีการ์ดโจมตีเหลือในมือ
        if(slashCards.length === 0){
            slashContext.waitingTrigger = false;
            game.log(player.name + " ไม่มี โจมตี ให้ใช้ ง้าวมังกรเขียว");
            
            controller.inputState = "idle";
            controller.selectedTriggerSkill = null;
            controller.triggerContext = null;
            return slashContext.resume();
        }
        // ใช้การ์ดโจมตีใบแรกที่พบ
        const slashInfo = slashCards[0];
        const slashCard = slashInfo.card;
        // นำการ์ดโจมตีออกจากมือ
        const removeSlash = player.hand.removeCard(slashInfo.index);
        if(!removeSlash){
            slashContext.waitingTrigger = false;

            controller.inputState = "idle";
            controller.selectedTriggerSkill = null;
            controller.triggerContext = null;
            return slashContext.resume();
        }
        // ทิ้งการ์ดลงกองทิ้ง
        game.discardPile.addCard(removeSlash);
        slashContext.waitingTrigger = false;
        game.log(player.name + " ใช้ ง้าวมังกรเขียว → โจมตี " + slashContext.target.name);
        
        controller.inputState = "idle";
        controller.selectedTriggerSkill = null;
        controller.triggerContext = null;
        // ยิง Slash ใบใหม่ใส่เป้าหมายเดิม
        return slashCard.resolveSlashTarget(player, slashContext.target, game);
    }
}