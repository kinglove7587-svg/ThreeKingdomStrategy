class GanNing extends Player{

    constructor(game, controllerClass){
        super("กำเหลง", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Ambushment (ซุ่มโจมตี)\n" +
            "คุณสามารถใช้การ์ดสีดำเป็น [ถอนสะพาน]";

        //this.addSkill(new Ambushment());
    }
}