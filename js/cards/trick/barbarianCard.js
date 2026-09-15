class BarbarianCard extends TrickCard{
    constructor(suit, number){
        super("กองทัพต่างแดน", suit, number);
    }
    // ประมวลผลการ์ดกองทัพต่างแดน (Barbarian Invasion)
    use(player, game){

        const targets = game.players.filter(
            target => target !== player
        );
        let targetIndex = 0;
        const resolveTarget = () => {
             while(
            targetIndex < targets.length &&
            (
                !targets[targetIndex] ||
                targets[targetIndex].hp <= 0
            )
            ){
                targetIndex++;
            }
            if(targetIndex >= targets.length){
                // รอให้ Call Stack ของ Card และ PassiveSkill ปัจจุบันทำงานเสร็จก่อน Finalize
                if(player.controller instanceof HumanController){
                    setTimeout(() => {
                        if(
                            game.actionLocked && 
                            !game.pendingAction && 
                            !game.triggerResolutionQueue.isWaiting()
                        ){
                            game.afterHumanAction(true);
                        }
                    }, 0);
                }
                return true;
            }
            const target = targets[targetIndex];
            targetIndex++;
            const success = game.askSlash(target);
            if(success){
                return resolveTarget();
            }
            const damage = new Damage(player, target, 1);
            damage.card = this;
            game.pauseAction(resolveTarget, false);
            game.damage(damage);
            if(game.triggerResolutionQueue.isWaiting()){
                return true;
            }
            // ถ้า Damage Flow Resume Action ให้แล้ว ห้าม Resume ซ้ำ
            if(!game.pendingAction){
                return true;
            }
            return game.resumeAction();
        };
        return resolveTarget();
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ผู้เล่นทุกคนยกเว้นผู้ใช้ต้องใช้ โจมตี ตอบ หากไม่สามารถใช้ โจมตี ได้ จะได้รับความเสียหาย 1";
    }
}