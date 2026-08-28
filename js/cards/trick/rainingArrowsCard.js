class RainingArrowsCard extends TrickCard{
    constructor(suit, number){
        super("ฝนธนู", suit, number);
    }
    // บังคับให้ผู้เล่นคนอื่นทุกคนทิ้งการ์ดหลบ (Dodge) หากไม่มีจะได้รับ Damage 1 หน่วย
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
                if(player.controller instanceof HumanController){
                    game.afterHumanAction(true);
                }
                return true;
            }

            const target = targets[targetIndex];
            targetIndex++;

            const success = game.askDodge(target);
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
            return game.resumeAction();
        };
        return resolveTarget();
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ผู้เล่นทุกคนยกเว้นผู้ใช้ต้องใช้ หลบ ตอบ หากไม่สามารถใช้ หลบ ได้ จะได้รับความเสียหาย 1";
    }
}