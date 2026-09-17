class SunShangxiang extends Player{

    constructor(game, controllerClass){
        super("ซุนซ่างเซียง", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wu";
        this.gender = "female";

        this.abilityDescription = 
            "Betrothment (สายสัมพันธ์สมรส)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถเลือกตัวละครเพศชายที่บาดเจ็บ 1 คน " +
            "จากนั้นทิ้งการ์ด 2 ใบจากมือของคุณ " +
            "เพื่อให้ทั้งคุณและตัวละครชายที่เลือกฟื้นฟู HP 1 หน่วย\n\n" +

            "Daredevil (แผนสลัดอาวุธ)\n" +
            "เมื่อคุณสูญเสียการ์ดอุปกรณ์ 1 ใบ คุณสามารถจั่วการ์ด 2 ใบ";

        this.addSkill(new Betrothment());
        //this.addSkill(new Daredevil());
    }
    getPortrait(){
        return "assets/cards/heroes/SunShangxiang.png";
    }
}