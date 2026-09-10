class Legacy extends TriggerSkill{

    constructor(){
        super("Legacy");

        this.legacyCards = null;
        this.legacySelectedCard = null;
        this.legacySelectedTarget = null;
    }
    // ลงทะเบียน Listener สำหรับ Trigger Skill Legacy
    register(eventManager, player){

        const callback = (damage, resolution) => {
            if(!damage){
                return;
            }
            // Legacy ทำงานเฉพาะเมื่อเจ้าของสกิลเป็นผู้ได้รับความเสียหาย
            if(damage.target !== player){
                return;
            }
            // ต้องเป็นความเสียหายที่มีจำนวนมากกว่า 0
            if(damage.amount <= 0){
                return;
            }
            player.game.log(player.name + " สกิล Legacy ทำงาน");
            // หยุด Trigger Flow เพื่อรอการตัดสินใจของผู้เล่น
            if(resolution){
                resolution.wait();
            }
            // แสดง Modal ให้กุยแกตัดสินใจว่าจะใช้ Legacy หรือไม่
            player.game.showModal({
                owner: player, 
                title: "Legacy (มรดก)", 
                message: 
                    player.name + " ได้รับความเสียหาย " + 
                    damage.amount + " หน่วย\n" + "ต้องการใช้ Legacy หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + "  เลือกใช้ Legacy");
                            // ตรวจสอบว่ามีการ์ดเพียงพอสำหรับ Legacy 2 ใบ
                            if(player.game.deck.cards.length < 2){
                                player.game.log("Legacy ไม่สามารถทำงานได้ เนื่องจากการ์ดในกองจั่วไม่พอ 2 ใบ");
                                // รอบนี้ยังไม่ Draw
                                if(resolution){
                                    resolution.resume();
                                }
                                return;
                            }
                            // จั่วการ์ด 2 ใบจากด้านบนของกองจั่ว
                            const card1 = player.game.deck.draw();
                            const card2 = player.game.deck.draw();
                            // เก็บการ์ดไว้ใน Temporary State ของ Legacy
                            this.legacyCards = [
                                card1, 
                                card2
                            ];
                            // แสดงผลตรวจสอบการ์ดที่ Legacy ได้มา
                            player.game.log(
                                player.name + "  Legacy ได้การ์ด 2 ใบ: " + 
                                card1.name + " " + card1.suit + " " + card1.number + " | " + 
                                card2.name + " " + card2.suit + " " + card2.number
                            );
                            // เปิดขั้นเลือกการ์ด 1 ใบจาก Legacy
                            this.showCardSelection(
                                player, 
                                resolution
                            );
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(player.name + " ไม่ใช้ Legacy");
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
    // แสดงการ์ด 2 ใบของ Legacy เพื่อเลือก 1 ใบ
    showCardSelection(player, resolution){

        if(!this.legacyCards || this.legacyCards.length !== 2){
            return;
        }

        const content = player.game.ui.createCardSelectionContent(
            this.legacyCards, 
            (selectedCards) => {

                if(!selectedCards || selectedCards.length !== 1){
                    return;
                }
                // จดจำการ์ดที่เลือก แต่ยังไม่ย้ายการ์ด
                this.legacySelectedCard = selectedCards[0];
                player.game.log(
                    player.name + "  เลือกการ์ด Legacy: " + 
                    this.legacySelectedCard.name + " " + 
                    this.legacySelectedCard.suit + " " + 
                    this.legacySelectedCard.number
                );
                // รอบนี้หยุดไว้หลังเลือกการ์ด
                player.game.hideModal();
            }, 
            {
                requiredCount: 1
            }
        );

        player.game.showModal({
            owner: player, 
            title: "Legacy (มรดก)", 
            message: "เลือกการ์ด 1 ใบ", 
            content: content, 
            buttons: [
                {
                    text: "ยืนยัน", 
                    onClick: () => {
                        // ตรวจสอบว่าผู้เล่นเลือกครบ 1 ใบแล้วหรือยัง
                        content.confirmSelection();
                    }
                }
            ]
        });
    }
}