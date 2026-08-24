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
                    console.log(
                        player.name + 
                        " Retaliation เลือกการ์ดจาก " + 
                        source.name
                    );
                    console.log("selectedCards =", selectedIndices);
                    console.log("selectedIndices =", selectedIndices);
                },
                {
                    requiredCount: 1
                }
            );
            // เปิด Generic Modal กลางหน้าจอ
            player.game.showModal({
                type: "cardSelection", 
                owner: player, 
                message: "เลือกการ์ด 1 ใบจากมือ " + source.name, 
                content: content, 
                buttons: [
                    {
                        text: "ยืนยัน", 
                        onClick: () => {
                            // ต้องเลือกครบก่อนยืนยัน
                            if(!content.confirmSelection()){
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