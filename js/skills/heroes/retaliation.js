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
            // ดึง Controller ของผู้มี Retaliation
            const controller = player.controller;
            // เก็บผู้ทำ Damage ซึ่งเป็นเจ้าของมือไพ่ที่ต้องเลือก
            const source = damage.source;
            // สร้าง Content สำหรับเลือกไพ่คว่ำจากมือของผู้ทำ Damage
            const content = player.game.ui.createCardBackSelectionContent(
                source.hand.cards, 
                (selectedCards, selectedIndices) => {
                    // บันทึก Source ของ Retaliation
                    controller.retaliationTarget = source;
                    // บันทึกการ์ดที่เลือก
                    controller.selectedRetaliationCard = selectedCards[0];
                    // บันทึก Index ที่เลือก
                    controller.selectedRetaliationCardIndex = selectedIndices[0];
                    console.log(
                        player.name + " Retaliation เลือกการ์ดจาก " + source.name
                    );
                    console.log(
                        "selectedRetaliationCard =", controller.selectedRetaliationCard
                    );
                    console.log(
                        "selectedRetaliationCardIndex =", controller.selectedRetaliationCardIndex
                    );
                },
                {
                    requiredCount: 1
                }
            );
            // เปิด Generic Modal กลางหน้าจอ
            player.game.showModal({
                type: "cardSelection", 
                owner: player, 
                title: "สกิล Retaliation ของ สุมาอี้ ทำงาน",
                message: "สุมาอี้ ได้รับความเสียหาย เลือกการ์ด 1 ใบจากมือ " + source.name, 
                content: content, 
                buttons: [
                    {
                        text: "ยืนยัน", 
                        onClick: () => {
                            // ต้องเลือกครบก่อนยืนยัน
                            if(!content.confirmSelection()){
                                return;
                            }
                            // ย้ายการ์ดจากมือ Source เข้ามือผู้ใช้ Retaliation
                            if(!controller.confirmRetaliationSelection()){
                                return;
                            }
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
        // ฟัง Event หลังได้รับความเสียหาย
        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}