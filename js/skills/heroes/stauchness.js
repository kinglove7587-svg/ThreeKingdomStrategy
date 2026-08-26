class Stauchness extends TriggerSkill{

    constructor(){
        super("Stauchness");
    }
    register(eventManager, player){

        const callback = (damage) => {
            if(!damage){
                return;
            }
            if(damage.target !== player){
                return;
            }
            if(damage.amount <= 0){
                return;
            }
            player.game.log(player.name + " ใช้สกิล Stauchness ");

            player.game.showModal({
                title: player.name + " ใช้ สกิล Stauchness", 
                message: "ผู้ตัดสินใจ: " + player.name, 
                content: "แฮหัวตุ้นได้รับความเสียหาย " + damage.amount + " หน่วย\nต้องการใช้สกิลหรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " เลือกใช้ Stauchness");
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " ไม่ใช้ Stauchness");
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