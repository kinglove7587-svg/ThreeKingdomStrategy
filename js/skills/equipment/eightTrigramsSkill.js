class EightTrigramsSkill extends ArmorSkill{
    // ตัวสร้างออบเจกต์ EightTrigramsSkill (กำหนดชื่อสกิลเกราะแปดทิศ)
    constructor(){
        super("EightTrigrams"); // ตั้งชื่อสกิลเป็น "EightTrigrams"
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // สร้าง Callback Function สำหรับดักจับ Event beforeDodge
        const callback = (context)=>{
            // ทำงานเฉพาะเมื่อผู้เล่นที่เป็นเป้าหมาย (target) คือเจ้าของเกราะเกราะแปดทิศนี้
            if(context.target !== player){
                return;
            }
            player.game.log(player.name + " ใช้เกราะเกราะแปดทิศ");
            // Judge แบบ Callback เพื่อรองรับ Pause / Resume
            player.game.judge(
                player, 
                (result) => {
                    // ตรวจผล Judge หลัง Resume
                    if(result.isRed()){
                        context.fromArmor = true;
                        context.dodge = true;
                    }
                    // Resume Flow ของ Dodge หลัง Judge เสร็จ
                    if(typeof context.resume === "function"){
                        context.resume();
                    }
                }
            );
            // บอก Flow ภายนอกว่า Trigger นี้อาจกำลังรอ Judge
            if(player.game.pendingJudge){
                context.waitingJudge = true;
            }
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}