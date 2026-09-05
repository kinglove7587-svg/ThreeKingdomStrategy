class Lust extends ActiveSkill{

    constructor(){
        super("Lust");

        this.usedThisPlayPhase = false;
    }
    getDescription(){
        return "Lust (เสน่หา)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถทิ้งการ์ด 1 ใบ " +
            "เพื่อเลือกตัวละครชาย 2 คนให้ ดวลเดี่ยว กัน " +
            "คุณเป็นผู้กำหนดว่าใครจะเป็นฝ่าย โจมตี ก่อน " +
            "และผลนี้ไม่สามารถถูกยกเลิกด้วย หักล้าง"; 
    }
    
}