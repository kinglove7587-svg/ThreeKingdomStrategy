class HuangGai extends Player{

    constructor(game, controllerClass){
        super("อุยกาย", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Self Sacrifice (เสียสละ)\n" +
            "ใน Play Phase คุณสามารถเลือกที่จะเสียพลังชีวิต 1 หน่วย " +
            "เพื่อจั่วการ์ด 2 ใบ และ การ์ดในมือต้องมีน้อยกว่า 5 ใบถึงจะใช้ได้";

        this.addSkill(new SelfSacrifice());
    }
    getPortrait(){
        return "assets/cards/heroes/HuangGai.png";
    }
}