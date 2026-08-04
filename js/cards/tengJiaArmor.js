class TengJiaArmor extends ArmorCard{
    // ตัวสร้างออบเจกต์การ์ดอุปกรณ์ประเภทเกราะ "เกราะหวาย" (Vine Armor)
    constructor(suit, number){
        super("เกราะหวาย", suit, number);
        
        this.skills.push(new TengJiaSkill()); // เพิ่มสกิลประจำเกราะเข้าสู่ตัวการ์ด
    }
}