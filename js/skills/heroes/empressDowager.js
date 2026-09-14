class EmpressDowager extends TriggerSkill{

    constructor(){
        super("Empress Dowager");
    }
    //
    register(eventManager, player){

        const callback = (context, resolution) => {
            if(!context || context.target !== player){
                return;
            }
            if(context.disableDodge){
                return;
            }
            if(context.dodge){
                return;
            }

            const blackCards = player.hand.cards.filter(
                card => card.suit === "♠️" || card.suit === "♣️"
            );
            if(blackCards.length === 0){
                return;
            }

            if(resolution){
                resolution.wait();
            }
            player.game.log(
                player.name + " สกิล Empress Dowager ทำงาน"
            );

            const showChoiceModal = () => {
                player.game.showModal({
                    owner: player, 
                    title: "Empress Dowager (จักรพรรดินี)", 
                    message: 
                        player.name + 
                        " ตกเป็นเป้าหมายของ [โจมตี]\n" +
                        "ต้องการใช้การ์ดสีดำแทน [หลบ] หรือไม่?", 
                    buttons: [
                        {
                            text: "ใช้", 
                            onClick: () => {
                                player.game.hideModal();
                                player.game.log(player.name + " ใช้ Empress Dowager");

                                const currentBlackCards = 
                                    player.hand.cards.filter(
                                        card => 
                                            card.suit === "♠️" || 
                                            card.suit === "♣️"
                                    );
                                if(currentBlackCards.length === 0){
                                    showChoiceModal();
                                    return;
                                }

                                const content = 
                                    player.game.ui.createCardSelectionContent(
                                        currentBlackCards, 
                                        (selectedCards) => {
                                            if(
                                                !selectedCards || 
                                                selectedCards.length !== 1
                                            ){
                                                return;
                                            }
                                            console.log(
                                                player.name + 
                                                " เลือกการ์ด Empress Dowager:", 
                                                selectedCards[0]
                                            );
                                        }, 
                                        {
                                            requiredCount: 1
                                        }
                                    );
                                player.game.showModal({
                                    owner: player, 
                                    title: "Empress Dowager (จักรพรรดินี)", 
                                    message: "เลือกการ์ดสีดำ 1 ใบเพื่อใช้แทน [หลบ]", 
                                    content: content, 
                                    buttons: [
                                        {
                                            text: "ยืนยัน", 
                                            onClick: () => {
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

                                                const selectedCard = selectedCards[0];
                                                if(
                                                    selectedCard.suit !== "♠️" && 
                                                    selectedCard.suit !== "♣️"
                                                ){
                                                    return;
                                                }

                                                const cardIndex = 
                                                    player.hand.cards.indexOf(selectedCard);
                                                if(cardIndex === -1){
                                                    return;
                                                }

                                                const usedCard = 
                                                    player.hand.removeCard(cardIndex);
                                                if(!usedCard){
                                                    return;
                                                }
                                                player.game.discardPile.addCard(usedCard);
                                                context.dodge = true;
                                                context.requiredDodgeCount = 0;
                                                player.game.log(
                                                    player.name + " ใช้ " + 
                                                    usedCard.name + " " + 
                                                    usedCard.suit + " แทน [หลบ] ด้วย Empress Dowager"
                                                );
                                                player.game.hideModal();
                                                if(resolution){
                                                    resolution.resume();
                                                }

                                                if(
                                                    !player.game.triggerResolutionQueue.isWaiting() && 
                                                    !player.game.pendingAction && 
                                                    player.game.actionLocked
                                                ){
                                                    player.game.afterHumanAction(true);
                                                }
                                            }
                                        }, 
                                        {
                                            text: "ยกเลิก", 
                                            onClick: () => {
                                                player.game.hideModal();
                                                showChoiceModal();
                                            }
                                        }
                                    ]
                                });
                            }
                        }, 
                        {
                            text: "ไม่ใช้", 
                            onClick: () => {
                                player.game.hideModal();
                                player.game.log(player.name + " ไม่ใช้ Empress Dowager");
                                if(resolution){
                                    resolution.resume();
                                }

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
            showChoiceModal();
        };

        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}