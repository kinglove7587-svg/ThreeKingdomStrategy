class EightTrigramsArmor extends ArmorCard{
    // สร้างเกราะเกราะแปดทิศ
    constructor(suit, number){
        // เรียกใช้ constructor ของคลาสแม่ (ArmorCard)
        super("เกราะแปดทิศ", suit, number);
        //
        this.skills = [new EightTrigramsSkill()];
    }
}