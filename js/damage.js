class Damage{
    // ตัวสร้างออบเจกต์เก็บข้อมูลความเสียหาย (Data Object)
    constructor(source, target, amount){
        // ผู้สร้างความเสียหาย (Player ฝั่งโจมตี)
        this.source = source;
        // ผู้ได้รับความเสียหาย (Player ฝั่งรับ)
        this.target = target;
        // จำนวนความเสียหาย (หน่วย HP ที่ต้องลด)
        this.amount = amount;
        // การ์ดที่เป็นต้นเหตุของความเสียหาย (เช่น SlashCard, FireAttackCard)
        this.card = null;
        // ประเภทความเสียหาย (เช่น "normal", "fire", "thunder")
        this.type = "normal";
        // สถานะการถูกยกเลิกดาเมจ (ถ้า true จะไม่ลด HP)
        this.canceled = false;
    }
}