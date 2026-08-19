class SilverLionHelmetCard extends ArmorCard{

    constructor(suit, number){
        super("หมวกสิงโตเงิน", suit, number);

        this.addSkill(new SilverLionHelmetSkill());
    }
    getDescription(){
        return "ตราบใดที่คุณสวมใส่อุปกรณ์ชิ้นนี้อยู่ เมื่อคุณได้รับความเสียหาย มากกว่า 1 หน่วย ใน 1 ครั้ง ความเสียหายนั้นจะถูกจำกัดและ ลดเหลือเพียง 1 หน่วยเสมอ เมื่อการ์ดใบนี้ถูกหลุดออกจากโซนอุปกรณ์ของคุณ คุณจะ ฟื้นฟูพลังชีวิต (HP) 1 หน่วย ทันที";
    }
}