class Deflection extends TriggerSkill{

    constructor(){
        super("Deflection");
    }
    //
    register(eventManager, player){

        const callback = (context, resolution) => {
            if(!context){
                return;
            }
            // ต้องเป็นการโจมตีที่มีไต้เกี้ยวเป็น Target
            if(context.target !== player){
                return;
            }
            // ต้องมีการ์ดในมืออย่างน้อย 1 ใบ
            if(player.hand.cards.length === 0){
                return;
            }
            player.game.log(
                player.name + "  สกิล Deflection ทำงาน"
            );
            // หยุด Slash Flow เพื่อรอการตัดสินใจ
            if(resolution){
                resolution.wait();
            }

            player.game.showModal({
                owner: player, 
                title: "Deflection (เบี่ยงเบน)", 
                message: player.name + 
                    " ตกเป็นเป้าหมายของ [โจมตี]\n" +
                    "ต้องการใช้ Deflection หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(
                                player.name + " เลือกใช้ Deflection"
                            );
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(
                                player.name + " ไม่ใช้ Deflection"
                            );
                            // Resume Slash เดิม
                            if(resolution){
                                resolution.resume();
                            }
                        }
                    }
                ]
            });
        };
        // Deflection ทำงานที่ beforeDodge
        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}