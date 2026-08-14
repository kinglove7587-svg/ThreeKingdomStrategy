class EightTrigramsArmor extends ArmorCard{
    // สร้างเกราะเกราะแปดทิศ
    constructor(suit, number){
        // เรียกใช้ constructor ของคลาสแม่ (ArmorCard)
        super("เกราะแปดทิศ", suit, number);
        //
        this.skills = [new EightTrigramsSkill()];
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เมื่อกำลังจะถูก โจมตี เปิดไพ่ Judge 1 ใบ หากเป็นสีแดง (♥️ หรือ ♦️) ให้หลบการโจมตีสำเร็จ";
    }
}