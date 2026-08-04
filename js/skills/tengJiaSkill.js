class TengJiaSkill extends TriggerSkill{
    // ตัวสร้างออบเจกต์สกิลประเภท Trigger "หวายเกราะ" (Vine Armor Skill)
    constructor(){
        super("หวายเกราะ");
    }
    // ลงทะเบียนดักจับ Event เมื่อผู้เล่นสวมใส่เกราะใบนี้
    register(eventManager, player){
        // ฟังก์ชัน Callback สำหรับทำงานเมื่อเกิด Event ก่อนรับความเสียหาย (beforeDamage)
        const callback = (damage)=>{
            // ตรวจสอบว่าเป้าหมายที่กำลังจะได้รับความเสียหายคือผู้เล่นที่สวมเกราะนี้หรือไม่
            if (damage.target !== player){
                return;
            }
            // ตรวจสอบว่าความเสียหายนั้นเป็นธาตุไฟหรือไม่ 
            if (damage.type !== DamageType.FIRE){
                return;
            }
            // เพิ่มความเสียหายไฟขึ้นอีก 1 หน่วย
            damage.amount++;
            player.game.log(player.name + " ได้รับผลของหวายเกราะ ความเสียหายไฟ +1");
        };
        // ลงทะเบียน Listener ดักจับ Event "beforeDamage"
        this.registerListener(eventManager, "beforeDamage", callback);
    }
}