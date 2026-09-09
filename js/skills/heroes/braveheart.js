class Braveheart extends TriggerSkill{

    constructor(){
        super("Braveheart");
    }
    register(eventManager, player){

        const callback = (context, resolution) => {
            // ต้องเป็นผู้ถูกโจมตีคือเจ้าของ Skill
            if(context.target !== player){
                return;
            }
            // ถ้ามี Dodge อยู่ในมือ → ไม่ใช้ Braveheart
            const dodgeIndex = player.hand.findCardIndexByName("หลบ");
            if(dodgeIndex !== -1){
                return;
            }
            // หา Slash ในมือ
            const slashCards = player.hand.findSlashCards();
            // ไม่มี Slash → ปล่อยให้ Dodge Flow ปกติ
            if(slashCards.length === 0){
                return;
            }
            // หยุด Trigger Resolution
            if(resolution){
                resolution.wait();
            }
            player.game.log(player.name + " Braveheart (ห้าวหาญ) ทำงาน");

            player.game.showModal({
                owner: player, 
                title: "Braveheart (ห้าวหาญ)", 
                message: "ต้องการใช้ โจมตี 1 ใบ แทน หลบ หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        onClick: () => {
                            this.resolveChoice(
                                player, 
                                player.game, 
                                {
                                    context: context, 
                                    resolution: resolution
                                }, 
                                true
                            );
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        onClick: () => {
                            this.resolveChoice(
                                player, 
                                player.game, 
                                {
                                    context: context, 
                                    resolution: resolution
                                },
                                false
                            );
                        }
                    }
                ]
            });
        };

        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
    resolveChoice(player, game, data, useSkill){

        const context = data.context;
        const resolution = data.resolution;
        if(!useSkill){
            game.hideModal();
            if(resolution){
                resolution.resume();
            }
            game.ui.render();
            return;
        }

        const slashCards = player.hand.findSlashCards();
        if(slashCards.length === 0){
            game.hideModal();
            if(resolution){
                resolution.resume();
            }
            game.ui.render();
            return;
        }

        const slashInfo = slashCards[0];
        const slashCard = slashInfo.card;

        const removeSlash = player.hand.removeCard(slashInfo.index);
        if(!removeSlash){
            game.hideModal();
            if(resolution){
                resolution.resume();
            }
            game.ui.render();
            return;
        }

        game.discardPile.addCard(removeSlash);
        context.dodge = true;
        game.log(
            player.name + " ใช้ Braveheart → โจมตี 1 ใบ แทน หลบ"
        );

        game.hideModal();
        if(resolution){
            resolution.resume();
        }
        game.ui.render();
    }
}