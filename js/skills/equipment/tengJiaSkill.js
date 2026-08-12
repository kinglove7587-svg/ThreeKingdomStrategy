class TengJiaSkill extends TriggerSkill{
    // ตัวสร้างออบเจกต์สกิลประเภท Trigger "เกราะหวาย" (Vine Armor Skill)
    constructor(){
        super("เกราะหวาย");
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
            player.game.log(player.name + " ได้รับผลของเกราะหวาย ความเสียหายไฟ +1");
        };
        // ลงทะเบียน Listener ดักจับ Event "beforeDamage"
        this.registerListener(eventManager, "beforeDamage", callback);
        // ฟังก์ชัน Callback สำหรับดักจับการถูกโจมตีด้วยการ์ดโจมตี
        const slashCallback = (context)=>{
            // ตรวจสอบว่าเป้าหมายคือผู้เล่นที่สวมเกราะนี้หรือไม่
            if (context.target !== player){
                return;
            }
            // ตรวจสอบว่าเป็นการ์ดโจมตีธรรมดาหรือไม่ (ถ้าไม่ใช่ ให้ข้ามไป)
            if (!(context.card instanceof SlashCard)){
                return;
            }
            // ตรวจสอบว่าเป็นความเสียหายปกติหรือไม่ (ถ้าเป็น Fire Slash / Thunder Slash ให้ข้ามไป)
            if (context.card.damageType !== DamageType.NORMAL){
                return;
            }
            // ยกเลิกการถูกโจมตีด้วยการ์ดโจมตีธรรมดา
            context.canceled = true;
            player.game.log(player.name + " เกราะหวายป้องกันการ์ดโจมตี");
        };
        // ลงทะเบียน Listener ดักจับ Event "beforeSlashHit"
        this.registerListener(eventManager, "beforeSlashHit", slashCallback);
    }
}