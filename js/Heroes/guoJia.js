class GuoJia extends Player{

    constructor(game, controllerClass){
        super("กุยแก", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wei";
        this.gender= "male";

        this.abilityDescription = 
            "Jealousy Of God (ริษยาแห่งเทพ)\n" +
            "หลังจากการ์ด Judge ของคุณมีผล " +
            "คุณสามารถนำการ์ดใบนั้นมาไว้ในมือของคุณได้\n\n" +
            "Legacy (มรดก)\n" +
            "หลังจากคุณได้รับความเสียหาย 1 หน่วย " +
            "คุณสามารถดูการ์ด 2 ใบจากด้านบนของกองจั่ว " +
            "จากนั้นแจกการ์ดเหล่านั้นให้ตัวละครใดก็ได้ รวมถึงตัวคุณเอง";

        //this.addSkill(new JealousyOfGod());
        //this.addSkill(new Legacy());
    }
    getPortrait(){
        return "assets/cards/heroes/GuoJia.png";
    }
}