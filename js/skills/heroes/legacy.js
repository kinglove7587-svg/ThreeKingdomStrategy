class Legacy extends TriggerSkill{

    constructor(){
        super("Legacy");

        this.legacyCards = null;
        this.legacySelectedCard = null;
        this.legacySelectedTarget = null;
    }

    register(eventManager, player){

        const callback = (damage, resolution) => {
            if(!damage){
                return;
            }
            // Legacy ทำงานเฉพาะเมื่อเจ้าของสกิลเป็นผู้ได้รับความเสียหาย
            if(damage.target !== player){
                return;
            }
            // ต้องเป็นความเสียหายที่มีจำนวนมากกว่า 0
            if(damage.amount <= 0){
                return;
            }
            player.game.log(player.name + " สกิล Legacy ทำงาน");
            // หยุด Trigger Flow เพื่อรอการตัดสินใจของผู้เล่น
            if(resolution){
                resolution.wait();
            }
        };

        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}