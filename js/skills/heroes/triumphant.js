class Triumphant extends TriggerSkill{

    constructor(){
        super("Triumphant");
    }
    register(eventManager, player){

        const callback = (damage, resolution) => {
            // ต้องเป็น Damage ที่ HuaXiong เป็นเป้าหมาย
            if(damage.target !== player){
                return;
            }
            // ต้องได้รับความเสียหายจริง
            if(damage.amount <= 0){
                return;
            }
            // ต้องมีผู้สร้างความเสียหาย
            if(!damage.source){
                return;
            }
            // ต้องเกิดจากการ์ดโจมตี
            if(!(damage.card instanceof SlashCard)){
                return;
            }
            // ต้องเป็นการ์ดโจมตีสีแดง
            if(damage.card.suit !== "♥️" && damage.card.suit !== "♦️"){
                return;
            }

            const source = damage.source;
            // หยุด Trigger Resolution ไว้ก่อนรอการตัดสินใจ
            if(resolution){
                resolution.wait();
            }
            player.game.log(
                "สกิล Triumphant ของ " + player.name + " ทำงาน"
            );

            player.game.showModal({
                owner: source, 
                title: "สกิล Triumphant ทำงาน", 
                message: "คุณสามารถเลือกฟื้นฟู HP 1 หน่วย หรือจั่วการ์ด 1 ใบ", 
                buttons: [
                    {
                        text: "ฟื้นฟู HP 1", 
                        onClick: () => {
                            source.recoverHp(1);
                            player.game.log(
                                source.name + " เลือกฟื้นฟู HP 1 จาก Triumphant"
                            );
                            player.game.hideModal();
                            if(resolution){
                                resolution.resume();
                            }
                            player.game.ui.render();
                        }
                    }, 
                    {
                        text: "จั่วการ์ด 1 ใบ", 
                        onClick: () => {
                            source.drawCard(player.game.deck);
                            player.game.log(
                                source.name + " เลือกจั่วการ์ด 1 ใบจาก Triumphant"
                            );
                            player.game.hideModal();
                            if(resolution){
                                resolution.resume();
                            }
                            player.game.ui.render();
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