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
            "เพื่อจั่วการ์ด 2 ใบ";

        //
    }
    getPortrait(){
        return "assets/cards/heroes/HuangGai.png";
    }
}