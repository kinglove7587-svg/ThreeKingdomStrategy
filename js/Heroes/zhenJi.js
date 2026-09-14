class ZhenJi extends Player{

    constructor(game, controllerClass){
        super("เจิ้นจี", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction  = "Wei";
        this.gender = "female";

        this.abilityDescription = 
            "Empress Dowager (จักรพรรดินี)\n" +
            "คุณสามารถใช้หรือเล่นการ์ดสีดำ ♠️ ♣️ เป็น [หลบ]\n\n" +

            "Goddess Of Luo River (เทพธิดาแห่งแม่น้ำหลัว)\n" +
            "ใน Preparation Phase คุณสามารถเข้าสู่ Judge Phase ได้ " +
            "หากการ์ด Judge เป็นสีดำ คุณจะได้รับการ์ดใบนั้น " +
            "และสามารถทำขั้นตอนนี้ซ้ำได้ตราบใดที่การ์ด Judge ของคุณเป็นสีดำ";

        //this.addSkill(new EmpressDowager());
        //this.addSkill(new GoddessOfLuoRiver());
    }
    getPortrait(){
        return "assets/cards/heroes/ZhenJi.png";
    }
}