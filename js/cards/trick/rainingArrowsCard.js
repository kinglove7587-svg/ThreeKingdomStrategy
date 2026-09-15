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
                    setTimeout(() => {
                        if(
                            game.actionLocked && 
                            !game.pendingAction && 
                            !game.pendingModal && 
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
            // ใช้ Resolution ร่วมกับ askDodge เพื่อรอ Modal ของเป้าหมาย
            let waitingForDodge = false;
            const dodgeResolution = {
                wait: () => {
                    waitingForDodge = true;
                    // หยุด Action หลักไว้จนกว่าเป้าหมายจะตัดสินใจ Dodge
                    return game.pauseAction(
                        resolveTarget, 
                        false
                    );
                }, 
                resume: () => {
                    // ถ้ามี Trigger รออยู่ ให้ Trigger เป็นผู้จัดการ Flow ต่อ
                    if(game.triggerResolutionQueue.isWaiting()){
                        return true;
                    }
                    // ดำเนิน Action หลักต่อ
                    return game.resumeAction();
                }
            };
            // รับผลการตัดสินใจ Dodge จาก askDodge
            const handleDodgeResult = (success) => {
                if(success){
                    // ถ้าใช้ Dodge แล้ว ไม่ต้อง Damage
                    if(!waitingForDodge){
                        return resolveTarget();
                    }
                    return;
                }
                // ถ้าไม่ใช้/ไม่สามารถใช้ Dodge ให้รับ Damage
                const damage = new Damage(player, target, 1);
                damage.card = this;
                // เก็บ PendingAction ที่สร้างขึ้นสำหรับ Damage ครั้งนี้
                let pauseAction = null;
                // กรณีไม่มี Dodge Modal ต้องพัก Action ไว้ก่อน Damage
                if(!waitingForDodge){
                    game.pauseAction(
                        resolveTarget, 
                        false
                    );
                    // จำ PendingAction ตัวที่เพิ่งสร้างไว้
                    pauseAction = game.pendingAction;
                }
                game.damage(damage);
                // ถ้า Damage / Trigger ยังไม่ได้ Resume Action เดิม
                if(
                    !waitingForDodge && 
                    game.pendingAction === pauseAction
                ){
                    return game.resumeAction();
                }
            };
            // ให้ askDodge จัดการ Modal และเรียก handleDodgeResult เมื่อจบ
            const dodgeStarted = game.askDodge(
                target, 
                1, 
                dodgeResolution, 
                handleDodgeResult
            );
            // AI ไม่ได้เข้าสู่ Modal จึงต้องดำเนิน Flow ต่อจากผลทันที
            if(
                !waitingForDodge && 
                dodgeStarted
            ){
                return true;
            }
            // ถ้า askDodge ไม่ได้เริ่ม Dodge Flow ให้ไปเป้าหมายถัดไป
            if(
                !waitingForDodge && 
                !dodgeStarted
            ){
                return resolveTarget();
            }
            return true;
        };
        return resolveTarget();
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ผู้เล่นทุกคนยกเว้นผู้ใช้ต้องใช้ หลบ ตอบ หากไม่สามารถใช้ หลบ ได้ จะได้รับความเสียหาย 1";
    }
}