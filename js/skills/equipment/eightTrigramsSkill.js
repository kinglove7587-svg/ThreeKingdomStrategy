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
            // เรียก Judge และรอผลลัพธ์
            const result = player.game.judge(
                player,
                (judgeResult) => {

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
                    // อ่านผล Judge หลังถูกแก้ไขโดย Necromancy
                    const finalJudge = player.game.pendingJudge 
                        ? player.game.pendingJudge.result : null;
                    // ใช้ผล Judge ตัวสุดท้ายเป็นตัวตัดสิน Eight Trigrams
                    if(
                        finalJudge && finalJudge.isRed()
                    ){
                        context.fromArmor = true;
                        context.dodge = true;
                    }
                    context.waitingJudge = false;
                    if(resolution){
                        return resolution.resume();
                    }
                    return context.resume();
                };
                return;
            }
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}