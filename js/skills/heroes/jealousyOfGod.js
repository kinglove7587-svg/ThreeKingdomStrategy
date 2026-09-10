class JealousyOfGod extends TriggerSkill{

    constructor(){
        super("Jealousy Of God");
    }
    register(eventManager, player){

        const callback = (context) => {
            if(!context){
                return;
            }
            // ทำงานเฉพาะเมื่อ Judge เป็นของเจ้าของสกิล
            if(context.player !== player){
                return;
            }

            const judgeResult = context.card;
            if(!judgeResult || !judgeResult.card){
                return;
            }

            const judgeCard = judgeResult.card;
            // หยุด Judge เพื่อรอการตัดสินใจ
            player.game.pauseJudge({
                player: context.player, 
                result: judgeResult, 
                onResume: result => {
                    console.log("Jealousy Of God Judge Resume =", result);
                }
            });
            player.game.log(
                player.name + " ใช้ Jealousy Of God กับ " + 
                judgeCard.name + " " + 
                judgeCard.suit + " " + 
                judgeCard.number
            );
            // เปิด Modal ให้เจ้าของสกิลตัดสินใจ
            player.game.showModal({
                owner: player, 
                title: "Jealousy Of God", 
                message: 
                    "คุณต้องการนำการ์ด Judge ใบนี้มาไว้ในมือหรือไม่?\n" + 
                    judgeCard.name + " " + 
                    judgeCard.suit + " " + 
                    judgeCard.number, 
                buttons: [
                    {
                        text: "ต้องการ", 
                        onClick: () => {

                            const pendingJudge = player.game.pendingJudge;
                            if(!pendingJudge){
                                return;
                            }

                            const finalCard = pendingJudge.result.card;
                            // หาตัวการ์ด Judge ใบสุดท้ายในกองทิ้ง
                            const discardIndex = player.game.discardPile.cards.indexOf(finalCard);
                            if(discardIndex === -1){
                                return;
                            }
                            // นำการ์ดเดียวกันออกจากกองทิ้ง
                            const takenCard = 
                                player.game.discardPile.cards.splice(
                                    discardIndex, 1
                                )[0];
                            if(!takenCard){
                                return;
                            }
                            // นำการ์ด Judge เข้า Hand
                            player.hand.addCard(takenCard);
                            player.game.log(
                                player.name + " นำ " + 
                                takenCard.name + " " + 
                                takenCard.suit + " " + 
                                takenCard.number + " จากกองทิ้งมาไว้ในมือ"
                            );
                            player.game.hideModal();
                            // Resume Judge ตาม Flow เดิม
                            player.game.resumeJudge(
                                pendingJudge.result
                            );
                        }
                    }, 
                    {
                        text: "ไม่ต้องการ", 
                        onClick: () => {

                            const pendingJudge = player.game.pendingJudge;
                            player.game.hideModal();
                            // Resume Judge เดิมโดยไม่ย้ายการ์ด
                            if(pendingJudge){
                                player.game.resumeJudge(
                                    pendingJudge.result
                                );
                            }
                        }
                    }
                ]
            });
        };

        this.registerListener(
            eventManager, 
            "judgeResolved", 
            callback
        );
    }
}