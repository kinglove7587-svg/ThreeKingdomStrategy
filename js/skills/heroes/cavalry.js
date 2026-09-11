class Cavalry extends TriggerSkill{

    constructor(){
        super("Cavalry");
    }
    //
    register(eventManager, player){

        const callback = (context) => {

            if(!context){
                return;
            }
            // ต้องเป็น Slash ที่ม้าเฉียวเป็นผู้โจมตี
            if(context.attacker !== player){
                return;
            }
            // Target ต้องมีการ์ด "หลบ"
            const dodgeIndex = context.target.hand.findCardIndexByName("หลบ");
            if(dodgeIndex === -1){
                return;
            }
            // หยุด Slash ไว้ก่อนถามผู้เล่น
            context.waitingTriggerChoice = true;
            // เปิด Trigger Choice เดิมของเกม
            player.controller.startTriggerChoice(
                this, 
                {
                    dodgeContext: context
                }
            );
        };

        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
    //
    resolveChoice(player, game, context, useSkill){

        const controller = player.controller;
        const dodgeContext = context.dodgeContext;
        // ตรวจ Context
        if(!dodgeContext){
            controller.inputState = "idle";
            controller.selectedTriggerSkill = null;
            controller.triggerContext = null;
            return false;
        }
        // ไม่ใช้ Cavalry
        if(!useSkill){
            dodgeContext.waitingTriggerChoice = false;
            game.log(player.name + " ไม่ใช้ Cavalry");

            controller.inputState = "idle";
            controller.selectedTriggerSkill = null;
            controller.triggerContext = null;

            return dodgeContext.resume();
        }
        game.log(
            player.name + " ใช้ Cavalry กับ " + dodgeContext.target.name
        );
        // Judge
        const result = game.judge(
            player, 
            (judgeResult) => {

                if(judgeResult.isRed()){
                    dodgeContext.disableDodge = true;
                    game.log(
                        player.name + " Cavalry Judge เป็นไพ่สีแดง → " + 
                        dodgeContext.target.name + " ไม่สามารถใช้หลบได้"
                    );
                }else{
                    game.log(
                        player.name + " Cavalry Judge เป็นไพ่สีดำ → " + 
                        dodgeContext.target.name + " ยังสามารถใช้หลบได้"
                    );
                }
                dodgeContext.waitingTriggerChoice = false;

                controller.inputState = "idle";
                controller.selectedTriggerSkill = null;
                controller.triggerContext = null;

                return dodgeContext.resume();
            }
        );
        // ถ้า Judge ต้องรอ
        if(result === null && game.pendingJudge){
            return;
        }
        return result;
    }
}