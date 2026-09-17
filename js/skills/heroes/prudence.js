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
        // หากไม่มี Target ที่สามารถเลือกได้
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

        const content = 
            game.ui.createTargetSelectionContent(
                targets, 
                (selectedPlayer) => {
                    if(selectedPlayer){
                        game.log(
                            player.name + " เลือก Target ของ Prudence: " + 
                            selectedPlayer.name
                        );
                    }else{
                        game.log(
                            player.name + " ยกเลิกการเลือก Target ของ Prudence"
                        );
                    }
                }, 
                {
                    filter: target => 
                        target !== player && 
                        target.isAlive()
                }
            );
        game.showModal({
            owner: player, 
            title: "Prudence (สุขุมรอบคอบ)", 
            message: "เลือกตัวละครอื่น 1 คน", 
            content: content, 
            buttons: [
                {
                    text: "ยืนยัน", 
                    role: "confirm", 
                    onClick: () => {
                        const selectedTarget = content.getSelectedPlayer();
                        if(!selectedTarget){
                            game.log("Prudence: กรุณาเลือกตัวละครก่อนยืนยัน");
                            return;
                        }
                        // Validate Target ซ้ำก่อนทำ Effect จริง
                        const currentTargets = game.players.filter(
                            target => 
                                target !== player && 
                                target.isAlive()
                        );
                        // Target เดิมใช้ไม่ได้แล้ว
                        if(!currentTargets.includes(selectedTarget)){
                            game.log("เป้าหมายของ Prudence ไม่สามารถเลือกได้แล้ว");
                            game.hideModal();
                            this.showTargetSelection(
                                player, 
                                resolution
                            );
                            return;
                        }

                        const handBefore = selectedTarget.hand.cards.length;
                        const drawCount = selectedTarget.hand.cards.length === 0 
                            ? 2 : 1;
                        for(let i = 0; i < drawCount; i++){
                            selectedTarget.drawCard(game.deck);
                        }

                        const actualDrawCount = 
                            selectedTarget.hand.cards.length - handBefore;
                        game.log(
                            player.name + " ใช้ Prudence ให้ " + 
                            selectedTarget.name + " จั่วการ์ด " + 
                            actualDrawCount + " ใบ"
                        );
                        game.hideModal();
                        if(resolution){
                            resolution.resume();
                        }
                        game.ui.render();
                    }
                }
            ]
        });
    }
}