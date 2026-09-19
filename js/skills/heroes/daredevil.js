class Daredevil extends TriggerSkill{

    constructor(){
        super("Daredevil");
    }
    // ลงทะเบียน Listener สำหรับสกิล Daredevil
    register(eventManager, player){

        const callback = (context, resolution) => {
            if(!context){
                return;
            }
            // Daredevil ทำงานเฉพาะเมื่อเจ้าของสกิลสูญเสีย Equipment
            if(context.player !== player){
                return;
            }

            const game = player.game;
            if(resolution){
                resolution.wait();
            }
            game.log("สกิลDaredevil ของ " + player.name + " ทำงาน");

            game.showModal({
                owner: player, 
                title: "Daredevil (แผนสลัดอาวุธ)", 
                message: 
                    player.name + " สูญเสียการ์ดอุปกรณ์ 1 ใบ ต้องการใช้ Daredevil จั่วการ์ด 2 ใบ หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        onClick: () => {
                            game.hideModal();
                            
                            const drawCards = [];
                            for(let i = 0; i < 2; i++){
                                const card = game.drawCardFromDeck();
                                if(!card){
                                    break;
                                }
                                player.hand.addCard(card);
                                drawCards.push(card);
                            }

                            const cardNames = drawCards.map(
                                card => card.name
                            );
                            game.log(
                                player.name + " ใช้ Daredevil จั่วการ์ด " + 
                                drawCards.length + " ใบ" + 
                                (
                                    drawCards.length > 0 
                                        ? " : " + cardNames.join(", ") : ""
                                )
                            );

                            if(resolution){
                                resolution.resume();
                            }
                            game.ui.render();
                        }
                    },
                    {
                        text: "ไม่ใช้", 
                        onClick: () => {
                            game.hideModal();
                            game.log(
                                player.name + " ไม่ใช้ Daredevil"
                            );

                            if(resolution){
                                resolution.resume();
                            }
                            game.ui.render();
                        }
                    }
                ]
            });
        };

        this.registerListener(
            eventManager, 
            "equipmentLost", 
            callback
        );
    }
}