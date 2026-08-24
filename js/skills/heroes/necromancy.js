class Necromancy extends TriggerSkill{

    constructor(){
        super("Necromancy");
    }
    // ลงทะเบียนที่จะทำงานเมื่อไพ่ถูกเปิดเผย
    register(eventManager, player){

        const callback = (context) => {
            if(!context){
                return;
            }
            console.log("Necromancy Judge Event =", context);
            console.log("Necromancy Owner =", player.name);
            console.log("Judge Player =", context.player?.name);
            console.log("Judge Card =", context.card);
            // หยุด Judge ก่อนเปิด Modal
            player.game.pauseJudge({
                player: context.player, 
                result: context.card, 
                onResume: result => {
                    console.log("Necromancy Judge Resume =", result);
                }
            });
            // สร้าง Content ภายใน callback
            const content = player.game.ui.createCardSelectionContent(
                player.hand.cards, 
                (selectedCards) => {
                    console.log("Necromancy selectedCards =", selectedCards);
                }, 
                {
                    requiredCount: 1
                }
            );
            console.log(
                "typeof content.getSelectedCards =", typeof content.getSelectedCards
            );
            console.log(
                "typeof content.getSelectedIndices =", typeof content.getSelectedIndices
            );
            
            
            // เปิด Generic Modal สำหรับเลือกการ์ดของเจ้าของ Necromancy
            player.game.showModal({
                type: "cardSelection", 
                owner: player, 
                title: "Necromancy", 
                message: "เลือกการ์ด 1 ใบจากมือของคุณ เพื่อจั่วตัดสินแทน", 
                content: content, 
                buttons: [
                    {
                        text: "ยืนยัน", 
                        onClick: () => {
                            // ต้องเลือกการ์ดให้ครบก่อนยืนยัน
                            if(!content.confirmSelection()){
                                console.log("ยังเลือกการ์ดไม่ครบ");
                                return;
                            }
                            // ดึงการ์ดที่เลือก
                            const selectedCards = content.getSelectedCards();
                            // ตรวจว่ามีการ์ดที่เลือกจริง
                            if(selectedCards.length === 0){
                                return;
                            }
                            // ดึง Pending Judge ที่กำลังรอ
                            const pendingJudge = player.game.pendingJudge;
                            // ตรวจสอบว่ามี Pending Judge จริง
                            if(!pendingJudge){
                                return;
                            }
                            // หา Index ของการ์ดที่เลือกในมือสุมาอี้
                            const selectedIndex = player.hand.cards.indexOf(selectedCards[0]);
                            // ตรวจสอบว่าการ์ดที่เลือกยังอยู่ในมือจริง
                            if(selectedIndex === -1){
                                return;
                            }
                            // นำการ์ดที่ใช้แทน Judge ออกจากมือ
                            const selectedCard = player.hand.removeCard(selectedIndex);
                            // นำการ์ดที่เลือกลงกองทิ้ง
                            player.game.discardPile.addCard(selectedCard);
                            // ใช้การ์ดที่ถูกทิ้งเป็นผล Judge แทน
                            pendingJudge.result.card = selectedCard;
                            // ปิด Modal
                            player.game.hideModal();
                            // Resume Judge
                            player.game.resumeJudge(pendingJudge.result);
                        }
                    }, 
                    {
                        text: "ยกเลิก", 
                        onClick: () => {
                            const pendingJudge = player.game.pendingJudge;
                            player.game.hideModal();
                            //
                            if(pendingJudge){
                                player.game.resumeJudge(pendingJudge.result);
                            }
                        }
                    }
                ]
            });
        };
        this.registerListener(
            eventManager, 
            "judgeCardRevealed", 
            callback
        );
    }
}