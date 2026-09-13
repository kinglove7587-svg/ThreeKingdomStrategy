class Deflection extends TriggerSkill{

    constructor(){
        super("Deflection");
    }
    //
    register(eventManager, player){

        const callback = (context, resolution) => {
            if(!context){
                return;
            }
            // ต้องเป็นการโจมตีที่มีไต้เกี้ยวเป็น Target
            if(context.target !== player){
                return;
            }
            // ต้องมีการ์ดในมืออย่างน้อย 1 ใบ
            if(player.hand.cards.length === 0){
                return;
            }
            player.game.log(
                player.name + "  สกิล Deflection ทำงาน"
            );
            // หยุด Slash Flow เพื่อรอการตัดสินใจ
            if(resolution){
                resolution.wait();
            }

            player.game.showModal({
                owner: player, 
                title: "Deflection (เบี่ยงเบน)", 
                message: player.name + 
                    " ตกเป็นเป้าหมายของ [โจมตี]\n" +
                    "ต้องการใช้ Deflection หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        role: "confirm", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(
                                player.name + " เลือกใช้ Deflection"
                            );
                            // สร้าง Card Selection สำหรับเลือกการ์ด 1 ใบจากมือ
                            const content = 
                                player.game.ui.createCardSelectionContent(
                                    player.hand.cards, 
                                    (selectedCards) => {
                                        if(
                                            !selectedCards || 
                                            selectedCards.length !== 1
                                        ){
                                            return;
                                        }
                                        // เก็บการ์ดที่เลือกไว้ก่อน ยังไม่ทิ้งทันที
                                        this.selectedCard = selectedCards[0];
                                        player.game.log(
                                            player.name + "  เลือกการ์ด Deflection: " + 
                                            this.selectedCard.name + " " + 
                                            this.selectedCard.suit + " " + 
                                            this.selectedCard.number
                                        );
                                    }, 
                                    {
                                        requiredCount: 1
                                    }
                                );
                            // เปิด Modal สำหรับเลือกการ์ด
                            player.game.showModal({
                                owner: player, 
                                title: "Deflection (เบี่ยงเบน)", 
                                message: "เลือกการ์ด 1 ใบเพื่อทิ้ง", 
                                content: content, 
                                buttons: [
                                    {
                                        text: "ยืนยัน", 
                                        onClick: () => {
                                            // ต้องเลือกการ์ดให้ครบ 1 ใบก่อน
                                            if(!content.confirmSelection()){
                                                return;
                                            }

                                            const selectedCards = content.getSelectedCards();
                                            if(
                                                !selectedCards || 
                                                selectedCards.length !== 1
                                            ){
                                                return;
                                            }
                                            // เก็บการ์ดที่เลือก
                                            this.selectedCard = selectedCards[0];
                                            // สร้างรายการ Target ที่อยู่ในระยะโจมตีของไต้เกี้ยว
                                            const availableTargets = player.game.players.filter(
                                                target => {
                                                    // ห้ามเลือกตัวเอง
                                                    if(target === player){
                                                        return false;
                                                    }
                                                    // ห้ามเลือกผู้ที่ใช้ [โจมตี]
                                                    if(target === context.attacker){
                                                        return false;
                                                    }
                                                    // ต้องอยู่ในระยะโจมตีของไต้เกี้ยว
                                                    return player.game.getAttackDistance(
                                                        player, 
                                                        target
                                                    ) <= 1;
                                                }
                                            );
                                            // ถ้าไม่มี Target ที่ถูกต้อง ไม่ให้ไปต่อ
                                            if(availableTargets.length === 0){
                                                player.game.log(
                                                    player.name + " ไม่มี Target ที่สามารถใช้ Deflection ได้"
                                                );
                                                return;
                                            }
                                            // สร้าง UI สำหรับเลือก Target ใหม่
                                            const targetContent = 
                                                player.game.ui.createTargetSelectionContent(
                                                    availableTargets, 
                                                    (selectedPlayer) => {
                                                        if(selectedPlayer){
                                                            this.selectedTarget = selectedPlayer;
                                                        }
                                                    }
                                                );
                                            // เปลี่ยน Modal เป็นขั้นเลือก Target
                                            player.game.showModal({
                                                owner: player, 
                                                title: "Deflection (เบี่ยงเบน)", 
                                                message: "เลือกตัวละครที่เป็นเป้าหมายใหม่ของ [โจมตี]", 
                                                content: targetContent, 
                                                buttons: [
                                                    {
                                                        text: "ยืนยัน", 
                                                        onClick: () => {
                                                            const selectedTarget = targetContent.getSelectedPlayer();
                                                            if(!selectedTarget){
                                                                player.game.log(
                                                                    "Deflection: กรุณาเลือก Target ก่อนยืนยัน"
                                                                );
                                                                return;
                                                            }
                                                            this.selectedTarget = selectedTarget;
                                                            player.game.log(
                                                                player.name + 
                                                                " ยืนยัน Target Deflection: " + 
                                                                this.selectedTarget.name
                                                            );
                                                        }
                                                    }
                                                ]
                                            });
                                        }
                                    }
                                ]
                            });
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        role: "cancel", 
                        onClick: () => {
                            player.game.hideModal();
                            player.game.log(
                                player.name + " ไม่ใช้ Deflection"
                            );
                            // Resume Slash เดิม
                            if(resolution){
                                resolution.resume();
                            }
                            // Finalize Action หลัง Deflection ทำงานนอก Turn
                            if(
                                !player.game.triggerResolutionQueue.isWaiting() && 
                                !player.game.pendingAction && 
                                player.game.actionLocked
                            ){
                                player.game.afterHumanAction(true);
                            }
                        }
                    }
                ]
            });
        };
        // Deflection ทำงานที่ beforeDodge
        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}