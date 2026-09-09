class ZhouYu extends Player{

    constructor(game, controllerClass){
        super("จิวยี่", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Heroic (ความกล้าหาญ)\n" +
            "ใน Draw Phase คุณสามารถจั่วการ์ดเพิ่มอีก 1 ใบ\n\n" +
            "Sowing Distrust (แผนป้อนไส้ศึก)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถเลือกตัวละคร 1 คน " +
            "จากนั้นเลือกการ์ด 1 ใบจากมือของคุณและให้เป้าหมายเลือก 1 ดอก " +
            "หากดอกของการ์ดที่เปิดเผยแตกต่างจากดอกที่เป้าหมายเลือก " +
            "เป้าหมายได้รับความเสียหาย 1 หน่วย " +
            "(ไม่ว่าผลจะเป็นอย่างไร เป้าหมายจะเก็บการ์ดใบนั้นไว้ในมือ)";

        this.addSkill(new Heroic());
        this.addSkill(new SowingDistrust());
    }
    getPortrait(){
        return "assets/cards/heroes/ZhouYu.png";
    }
}