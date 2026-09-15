class YueJin extends Player{

    constructor(game, controllerClass){
        super("งักจิ้น", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Dauntless (กล้าหาญ)\n" +
            "จำกัด 1 ครั้งต่อ PlayPhase คุณสามารถทิ้งการ์ดพื้นฐาน 1 ใบ " +
            "เพื่อให้คุณเลือกทิ้งการ์ดอุปกรณ์ 1 ใบ " +
            "มิฉะนั้น คุณสร้างความเสียหาย 1 หน่วยแก่ตัวละครนั้น";

        this.addSkill(new Dauntless());
    }
    getPortrait(){
        return "assets/cards/heroes/YueJin.png";
    }
}