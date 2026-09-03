class DiaoChan extends Player{

    constructor(game, controllerClass){
        super("เตียวเสี้ยน", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Qun";
        this.gender = "female";

        this.abilityDescription = 
            "Lust (เสน่หา)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถทิ้งการ์ด 1 ใบ " +
            "เพื่อเลือกตัวละครชาย 2 คนให้ ดวลเดี่ยว กัน " +
            "คุณเป็นผู้กำหนดว่าใครจะเป็นฝ่าย โจมตี ก่อน " +
            "และผลนี้ไม่สามารถถูกยกเลิกด้วย หักล้าง\n\n" +

            "Beauty Outshining the Moon (จันทร์งามล่มเมือง)\n" +
            "Final Phase คุณสามารถจั่วการ์ด 1 ใบ";

        //
        //
    }
    getPortrait(){
        return "assets/cards/heroes/DiaoChan.png"
    }
}