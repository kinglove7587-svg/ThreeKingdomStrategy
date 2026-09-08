class BaredBodied extends TriggerSkill{

    constructor(){
        super("Bared Bodied");
    }
    // แทรกเข้าสู่ Draw Phase เพื่อถามว่าจะใช้ Bared Bodied หรือไม่
    onDrawPhase(player, game){

        if(player !== this.owner){
            return;
        }
        // ถ้ามีสุราลืมกลับอยู่ จะไม่สามารถใช้ Bared Bodied
        const hasLeBuSiShu = player.delayedTricks.some(
            card => card instanceof LeBuSiShuCard
        );
        if(hasLeBuSiShu){
            return;
        }
        // หยุด Draw Phase เพื่อรอการตัดสินใจ
        game.pauseDrawPhase(player);
        // ให้ผู้เล่นเลือกว่าจะใช้ Bared Bodied หรือไม่
        player.controller.startTriggerChoice(
            this, 
            {
                drawPhase: true
            }
        );
    }
    // ประมวลผลคำตอบว่าจะใช้ Bared Bodied หรือไม่
    resolveChoice(player, game, context, usedSkill){

        if(!usedSkill){
            game.log(player.name + " ไม่ใช้ Bared Bodied");
            return game.resumeDrawPhase();
        }
        game.log(player.name + " ใช้ Bared Bodied");
        // ใช้ Draw Phase แบบจั่วเพียง 1 ใบ
        return game.resumeDrawPhase(1);
    }
}