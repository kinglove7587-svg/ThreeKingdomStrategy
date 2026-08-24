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
                            if(!pendingJudge){
                                return;
                            }
                            // Resume Judge ด้วยผลเดิมก่อน
                            player.game.resumeJudge(pendingJudge.result);
                            // ปิด Modal
                            player.game.hideModal();
                        }
                    }, 
                    {
                        text: "ยกเลิก", 
                        onClick: () => {
                            player.game.hideModal();
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