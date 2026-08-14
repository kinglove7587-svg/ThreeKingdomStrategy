class TengJiaArmor extends ArmorCard{
    // ตัวสร้างออบเจกต์การ์ดอุปกรณ์ประเภทเกราะ "เกราะหวาย" (Vine Armor)
    constructor(suit, number){
        super("เกราะหวาย", suit, number);
        
        this.skills.push(new TengJiaSkill()); // เพิ่มสกิลประจำเกราะเข้าสู่ตัวการ์ด
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ป้องกัน การโจมตีปกติ หากโดนโจมตีด้วยธาตุไฟจะได้รับความเสียหายแรงขึ้น +1";
    }
}