class EightTrigramsSkill extends ArmorSkill{
    // ตัวสร้างออบเจกต์ EightTrigramsSkill (กำหนดชื่อสกิลเกราะแปดทิศ)
    constructor(){
        super("EightTrigrams"); // ตั้งชื่อสกิลเป็น "EightTrigrams"
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // สร้าง Callback Function สำหรับดักจับ Event beforeDodge
        const callback = (context, resolution)=>{
            // ทำงานเฉพาะเมื่อผู้เล่นที่เป็นเป้าหมาย (target) คือเจ้าของเกราะเกราะแปดทิศนี้
            if(context.target !== player){
                return;
            }
            player.game.log(player.name + " ใช้เกราะเกราะแปดทิศ");
            // เก็บผล Judge ตัวสุดท้ายไว้ใช้หลัง Judge Resume
            let finalJudgeResult = null;
            // ล็อก Before Dodge ก่อนเริ่ม Judge
            if(resolution){
                resolution.wait();
            }
            // เรียก Judge และรอผลลัพธ์
            const result = player.game.judge(
                player,
                (judgeResult) => {
                    // จำผล Judge ตัวสุดท้าย
                    finalJudgeResult = judgeResult;
                    // ตรวจผล Judge หลัง Judge เสร็จหรือ Resume
                    if(judgeResult.isRed()){
                        context.fromArmor = true;
                        context.dodge = true;
                    }
                }
            );

            // Judge ถูก Pause ต้องฝาก Flow Dodge ไว้สำหรับ Resume
            if(
                result === null &&
                player.game.pendingJudge
            ){
                context.waitingJudge = true;
                if(resolution){
                    resolution.wait();
                }
                // เมื่อ Judge Resume ให้ Trigger นี้ Resume ต่อเพียงครั้งเดียว
                player.game.pendingJudge.resumeFlow = () => {
                    // ตรวจผล Judge ที่ถูก Resume แล้ว
                    if(
                        finalJudgeResult && finalJudgeResult.isRed()
                    ){
                        context.fromArmor = true;
                        context.dodge = true;
                    }
                    context.waitingJudge = false;
                    if(resolution){
                        const result = resolution.resume();
                        if(
                            !player.game.triggerResolutionQueue.isWaiting() && 
                            !player.game.pendingAction && 
                            player.controller instanceof HumanController
                        ){
                            player.game.afterHumanAction(true);
                        }
                        return result;
                    }
                    return context.resume();
                };
                return;
            }
            // Judge จบโดยไม่ Pause ต้องปลดล็อก Trigger ทันที
            if(resolution){
                return resolution.resume();
            }
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}