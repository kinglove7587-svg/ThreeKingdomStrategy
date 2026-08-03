class EightTrigramsSkill extends TriggerSkill{
    // ตัวสร้างออบเจกต์ EightTrigramsSkill (กำหนดชื่อสกิลแปดทิศ)
    constructor(){
        super("EightTrigrams"); // ตั้งชื่อสกิลเป็น "EightTrigrams"
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // สร้าง Callback Function สำหรับดักจับ Event beforeDodge
        const callback = (context)=>{
            // ทำงานเฉพาะเมื่อผู้เล่นที่เป็นเป้าหมาย (target) คือเจ้าของเกราะแปดทิศนี้
            if (context.target !== player){
                return;
            }
            console.log(player.name + " ใช้เกราะแปดทิศ");
            // เปิดไพ่ใบบนสุดของกองเพื่อเตรียมเช็กผล Judge
            const judgeCard = player.game.deck.drawTopCard();
            // ป้องกันกรณีกองไพ่หมด
            if (!judgeCard){
                return;
            }
            // แสดงข้อมูลไพ่ที่เปิดได้ใน Console
            console.log("Judge :", judgeCard.suit, judgeCard.number);
            // หากเปิดได้ไพ่ดอกสีแดง (โพแดง ♥️ หรือ ข้าวหลามตัด ♦️) ถือว่าเสี่ยงดวงหลบสำเร็จ
            if (judgeCard.suit === "♥️" || judgeCard.suit === "♦️"){
                // กำหนดสถานะการหลบให้เป็น true
                context.dodge = true;
            }
            // นำไพ่ที่ใช้ Judge ย้ายลงกองทิ้งไพ่ (discardPile) ของเกม
            player.game.discardPile.addCard(judgeCard);
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}