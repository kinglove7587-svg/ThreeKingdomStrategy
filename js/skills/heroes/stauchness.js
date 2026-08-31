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
                                        player.name + " จั่วการ์ดจาก Stauchness ได้ " + 
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
                                    // สร้างฟังก์ชันสำหรับเปิด Choice ของ Stauchness
                                    const showStauchnessChoice = () => {
                                        player.game.showModal({
                                            title: "สกิล Stauchness ทำงาน", 
                                            message:  
                                                "ผู้ตัดสินใจ : " + damageSource.name + 
                                                "\nผล จั่ว ไม่ใช่ ♥️",
                                            buttons: [
                                                {
                                                    text: "ทิ้งการ์ด 2 ใบ", 
                                                    disabled: damageSource.hand.cards.length < 2, 
                                                    onClick: () => {
                                                        // สร้าง Content สำหรับเลือกการ์ด 2 ใบจากมือของ damage.source
                                                        const content = player.game.ui.createCardSelectionContent(
                                                            damageSource.hand.cards, 
                                                            (selectedCards) => {
                                                                console.log(
                                                                    damageSource.name + 
                                                                    " เลือกการ์ด Stauchness :", selectedCards
                                                                );
                                                                // ทิ้งการ์ดที่เลือกทั้ง 2 ใบจากมือของ damage.source
                                                                for(const card of selectedCards){
                                                                    const index = damageSource.hand.cards.indexOf(card);
                                                                    // ตรวจสอบว่าการ์ดยังอยู่ในมือก่อนทิ้ง
                                                                    if(index === -1){
                                                                        return;
                                                                    }

                                                                    const discardCard = damageSource.hand.removeCard(index);
                                                                    // นำการ์ดที่เลือกลงกองทิ้ง
                                                                    if(discardCard){
                                                                        player.game.discardPile.addCard(discardCard);
                                                                    }
                                                                }
                                                                player.game.log(damageSource.name + " ทิ้งการ์ด 2 ใบด้วย Stauchness");
                                                                player.game.hideModal();
                                                                if(resolution){
                                                                    resolution.resume();
                                                                }
                                                            }, 
                                                            {
                                                                requiredCount: 2
                                                            }
                                                        );
                                                        // เปิด Modal เดิมใหม่ พร้อม Card Selection Content
                                                        player.game.showModal({
                                                            title: "สกิล Stauchness ทำงาน", 
                                                            message: 
                                                                "ผู้ตัดสินใจ : " + damageSource.name + 
                                                                "\nเลือกการ์ด 2 ใบเพื่อทิ้ง", 
                                                            content: content, 
                                                            buttons: [
                                                                {
                                                                    text: "ยืนยัน", 
                                                                    onClick: () => {
                                                                        // ตรวจสอบว่าผู้เล่นเลือกครบ 2 ใบหรือยัง
                                                                        content.confirmSelection();
                                                                    }
                                                                }, 
                                                                {
                                                                    text: "ยกเลิก", 
                                                                    onClick: () => {
                                                                        // ยกเลิกการเลือกและกลับไป Choice เดิม
                                                                        showStauchnessChoice();
                                                                    }
                                                                }
                                                            ]
                                                        });
                                                    }
                                                }, 
                                                {
                                                    text: "รับความเสียหาย 1", 
                                                    onClick: () => {
                                                        player.game.log(damageSource.name + " เลือกรับความเสียหาย 1 จาก Stauchness");
                                                        player.game.hideModal();
                                                        // สร้าง Damage ใหม่ โดย Stauchness owner เป็นผู้สร้างความเสียหาย
                                                        const stauchnessDamage = new Damage(
                                                            player, 
                                                            damageSource, 
                                                            1, 
                                                            DamageType.NORMAL
                                                        );
                                                        // ปล่อย Trigger ของ Stauchness เดิมก่อน
                                                        if(resolution){
                                                            resolution.resume();
                                                        }
                                                        // ประมวลผล Damage ใหม่ผ่านระบบ Damage ปกติ
                                                        player.game.damage(stauchnessDamage);
                                                        player.game.ui.render();
                                                    }
                                                }
                                            ]
                                        });
                                    };
                                    // เปิด Choice ครั้งแรก
                                    showStauchnessChoice();
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