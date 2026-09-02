class GanNing extends Player{

    constructor(game, controllerClass){
        super("กำเหลง", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Ambushment (ซุ่มโจมตี)\n" +
            "คุณสามารถใช้ การ์ด ♠️ ♣️ เป็น [ถอนสะพาน]";

        this.addSkill(new Ambushment());
    }
    getPortrait(){
        return "assets/cards/heroes/ganNing.png";
    }
}