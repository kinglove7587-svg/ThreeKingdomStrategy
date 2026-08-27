class Stauchness extends TriggerSkill{

    constructor(){
        super("Stauchness");
    }
    register(eventManager, player){

        const callback = (damage, resolution) => {
            if(!damage){
                return;
            }
            if(damage.target !== player){
                return;
            }
            if(damage.amount <= 0){
                return;
            }
            player.game.log(" สกิล Stauchness " + " ของ " +  player.name + " ทำงาน ");

            const content = document.createElement("div");
            content.textContent = 
                "แฮหัวตุ้นได้รับความเสียหาย " + damage.amount + " หน่วย\nต้องการใช้สกิลหรือไม่ ?";
            content.style.whiteSpace = "pre-line";
            if(resolution){
                resolution.wait();
            }
            player.game.showModal({
                title: " สกิล Stauchness ทำงาน", 
                message: "ผู้ตัดสินใจ : " + player.name, 
                content: content,  
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " เลือกใช้ Stauchness");
                            player.game.judge(
                                player, 
                                (result) => {
                                    player.game.log(
                                        player.name + " Judge Stauchness ได้ " + 
                                        result.card.suit + " " + 
                                        result.card.number
                                    );
                                    // ตรวจผล Judge ว่าเป็น ♥️ หรือไม่
                                    if(result.isHeart()){
                                        if(resolution){
                                            resolution.resume();
                                        }
                                        return;
                                    }
                                    // ถ้าไม่ใช่ ♥️ ให้ผู้สร้างความเสียหายเป็นผู้ตัดสินใจ
                                    const damageSource = damage.source;
                                    player.game.showModal({
                                        title: "สกิล Stauchness ทำงาน", 
                                        message: 
                                            "ผล จั่ว ไม่ใช่ ♥️\n" + 
                                            "ผู้ตัดสินใจ : " + damageSource.name, 
                                        buttons: [
                                            {
                                                text: "ทิ้งการ์ด 2 ใบ", 
                                                onClick: () => {
                                                    console.log(
                                                        damageSource.name + 
                                                        " เลือกการ์ด 2 ใบด้วย Stauchness"
                                                    );
                                                }
                                            },
                                            {
                                                text: "รับความเสียหาย 1", 
                                                onClick: () => {
                                                    console.log(
                                                        damageSource.name + 
                                                        "เลือกรับความเสียหาย 1 จาก Stauchness"
                                                    );
                                                }
                                            }
                                        ]
                                    });
                                }
                            );
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " ไม่ใช้ Stauchness");
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