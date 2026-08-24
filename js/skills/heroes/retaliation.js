class Retaliation extends TriggerSkill{

    constructor(){
        super("Retaliation");
    }
    // ลงทะเบียนที่จะทำงานเมื่อผู้เล่นได้รับความเสียหาย
    register(eventManager, player){

        const callback = (damage) => {
            // ต้องเป็น Damage ที่สุมาอี้เป็นเป้าหมาย
            if(damage.target !== player){
                return;
            }
            // ต้องได้รับความเสียหายจริง
            if(damage.amount <= 0){
                return;
            }
            // ต้องมีตัวละครที่เป็นผู้ทำ Damage
            if(!damage.source){
                return;
            }
            // ผู้ทำ Damage ต้องมีไพ่ในมือ
            if(damage.source.hand.cards.length === 0){
                return;
            }
            console.log(player.name + " Retaliation จาก " + damage.source.name);
        };
        // ฟัง Event หลังได้รับความเสียหาย
        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}