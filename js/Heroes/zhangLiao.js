class ZhangLiao extends Player{

    constructor(game, controllerClass){
        super("จางเหลียว", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Assault (จู่โจม)\n" +
            "ใน Draw Phase คุณสามารถเลือกที่จะไม่จั่วการ์ดจากกองจั่ว " +
            "และเลือกตัวละครได้สูงสุด 2 คน " +
            "เพื่อรับการ์ดจากมือของแต่ละคนแทน";

        this.addSkill(new Assault());
    }
    getPortrait(){
        return "assets/cards/heroes/ZhangLiao.png"
    }
}