class LuMeng extends Player{

    constructor(game, controllerClass){
        super("ลิบอง", game, controllerClass);

        this.maxhp = 4;
        this.hp = 4;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Composure (ความเยือกเย็น)\n" + 
            "คุณสามารถ สามารถถือการ์ด ได้ สูงสุด 5 ใบ หากคุณไม่ได้ใช้การ์ด โจมตี ในระหว่างเทิร์นของคุณ"
    }
    getPortrait(){
        return "assets/cards/heroes/LuMeng.png"
    }
}