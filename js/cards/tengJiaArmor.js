class TengJiaArmor extends ArmorCard{
    // ตัวสร้างออบเจกต์การ์ดอุปกรณ์ประเภทเกราะ "หวายเกราะ" (Vine Armor)
    constructor(suit, number){
        super("หวายเกราะ", suit, number);
        
        this.skills.push(new TengJiaSkill()); // เพิ่มสกิลประจำเกราะเข้าสู่ตัวการ์ด
    }
}