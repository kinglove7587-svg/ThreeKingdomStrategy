class Prudence extends TriggerSkill{

    constructor(){
        super("Prudence");
    }
    // ลงทะเบียน listener สำหรับสกิล Prudence
    register(eventManager, player){

        const callback = (context, resolution) => {
            if(!context){
                return;
            }
            if(context.player !== player){
                return;
            }
            if(context.amount !== 1){
                return;
            }

            const game = player.game;
            const targets = game.players.filter(
                target => 
                    target !== player && 
                    target.isAlive()
            );
            if(targets.length === 0){
                return;
            }
            if(resolution){
                resolution.wait();
            }
            game.log(
                player.name + " สกิล Prudence ทำงาน"
            );

            game.showModal({
                owner: player, 
                title: "Prudence (สุขุมรอบคอบ)", 
                message: "คุณฟื้นฟู HP 1 หน่วย ต้องการใช้ Prudence หรือไม่?", 
                buttons: [
                    {
                        text: "ใช้", 
                        onClick: () => {
                            game.hideModal();
                            this.showTargetSelection(
                                player, 
                                resolution
                            );
                        }
                    }, 
                    {
                        text: "ไม่ใช้", 
                        onClick: () => {
                            game.hideModal();
                            game.log(
                                player.name + " ไม่ใช้ Prudence"
                            );
                            if(resolution){
                                resolution.resume();
                            }
                            game.ui.render();
                        }
                    }
                ]
            });
        };

        this.registerListener(
            eventManager, 
            "recoverHp", 
            callback
        );
    }
    // แสดงหน้าต่างเลือกเป้าหมายสำหรับสกิล Prudence
    showTargetSelection(player, resolution){

        const game = player.game;
        const targets = game.players.filter(
            target => 
                target !== player && 
                target.isAlive()
        );
        if(targets.length === 0){
            game.log(
                player.name + " ไม่สามารถใช้ Prudence ได้ เนื่องจากไม่มีตัวละครอื่นที่สามารถเลือกได้"
            );
            if(resolution){
                resolution.resume();
            }
            game.ui.render();
            return;
        }

        game.showModal({
            owner: player, 
            title: "Prudence (สุขุมรอบคอบ)", 
            message: "เลือกตัวละครอื่น 1 คน", 
            buttons: targets.map(target => ({
                text: target.name, 
                onClick: () => {
                    const currentTargets = game.players.filter(
                        currentTarget => 
                            currentTarget !== player && 
                            currentTarget.isAlive()
                    );
                    if(!currentTargets.includes(target)){
                        game.log("เป้าหมายของ Prudence ไม่สามารถเลือกได้แล้ว");
                        game.hideModal();
                        this.showTargetSelection(
                            player, 
                            resolution
                        );
                        return;
                    }

                    const handBefore = target.hand.cards.length;
                    const drawCount = target.hand.cards.length === 0 
                        ? 2 : 1;
                    for(let i = 0; i < drawCount; i++){
                        target.drawCard(game.deck);
                    }

                    const actualDrawCount = 
                        target.hand.cards.length - handBefore;
                    game.log(
                        player.name + " ใช้ Prudence ให้ " + 
                        target.name + " จั่วการ์ด " + 
                        actualDrawCount + " ใบ"
                    );
                    game.hideModal();
                    if(resolution){
                        resolution.resume();
                    }
                    game.ui.render();
                }
            }))
        });
    }
}