class HuaXiong extends Player{

    constructor(game, controllerClass){
        super("ฮัวหยง", game, controllerClass);

        this.maxHp = 6;
        this.hp = 6;
        this.faction = "Qun";
        this.gender = "male";

        this.abilityDescription = 
            "Triumphant (ฮึกเหิม)\n" +
            "เมื่อมีตัวละครสร้างความเสียหายแก่คุณด้วยการ์ด โจมตี สีแดง " +
            "ตัวละครนั้นสามารถเลือกฟื้นฟู HP 1 หน่วย หรือจั่วการ์ด 1 ใบ";
    }
    getPortrait(){
        return "assets/cards/heroes/HuaXiong.png";
    }
}