class Damage{
    // ตัวสร้างออบเจกต์เก็บข้อมูลความเสียหาย (Data Object)
    constructor(source, target, amount, type = DamageType.NORMAL){
        this.source = source; // ผู้สร้างความเสียหาย (Player หรือ null)
        this.target = target; // เป้าหมายที่รับความเสียหาย
        this.amount = amount; // จำนวนความเสียหาย
        this.type = type; // ประเภทความเสียหาย (NORMAL, THUNDER, FIRE)
        this.card = null; // การ์ดที่เป็นต้นเหตุความเสียหาย
        this.canceled = false; // สถานะการถูกยกเลิกความเสียหาย
        this.ignoreArmor = false; // ข้ามการคำนวณเกราะป้องกัน
        this.isEffectDamage = false; // เกิดจากเอฟเฟกต์/เสี่ยงทาย ไม่ใช่การโจมตีปกติ
        this.chain = false; // เป็น Damage ที่เกิดจากการส่งต่อผ่านโซ่หรือไม่
        this.waitingTrigger = false;
    }
}