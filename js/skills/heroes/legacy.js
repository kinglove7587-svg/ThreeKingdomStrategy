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
            // แสดง Modal ให้กุยแกตัดสินใจว่าจะใช้ Legacy หรือไม่
            player.game.showModal({
                owner: player, 
                title: "Legacy (มรดก)", 
                message: 
                    player.name + " ได้รับความเสียหาย " + 
                    damage.amount + " หน่วย\n" + "ต้องการใช้ Legacy หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + "  เลือกใช้ Legacy");
                            // รอบนี้ยังไม่ Draw
                            if(resolution){
                                resolution.resume();
                            }
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " ไม่ใช้ Legacy");
                            if(resolution){
                                resolution.resume();
                            }
                        }
                    }
                ]
            });
        };

        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}