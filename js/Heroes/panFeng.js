class PanFeng extends Player{

    constructor(game, controllerClass){
        super("พัวฮอง", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Qun";
        this.gender = "male";

        this.abilityDescription = 
            "Axe Of Insanity (ขวานคลุ้มคลั่ง)\n" +
            "จำกัดการใช้ได้ 1 ครั้งต่อ Play Phase " +
            "หลังจาก [โจมตี] ของคุณสร้างความเสียหายให้ตัวละครอื่น " +
            "หาก HP ของตัวละครนั้นน้อยกว่าคุณ คุณจั่วการ์ด 2 ใบ " +
            "หาก HP ของตัวละครนั้นมากกว่าหรือเท่ากับคุณ คุณเสีย HP 1 หน่วย";

        this.addSkill(new AxeOfInsanity());
    }
    getPortrait(){
        return "assets/cards/heroes/PanFeng.png";
    }
}