class SimaYi extends Player{

    constructor(gamae, controllerClass){
        super("สุมาอี้", gamae, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Retaliation (ขอคืนสนอง)\n" +
            "หลังจากคุณได้รับความเสียหาย คุณอาจได้รับการ์ด 1 ใบจากตัวละครที่สร้างความเสียหายให้คุณ\n" + 
            "(ใช้กับสกิลอาวุธไม่ได้)\n\n" + 
            "Necromancy (ศพคืนชีพ)\n" +
            "หลังจากเปิดไพ่ตัดสิน คุณอาจทิ้งการ์ด 1 ใบจากมือ ไพ่ที่ทิ้งจะกลายเป็นไพ่ตัดสินใบใหม่";

        this.addSkill(new Retaliation());
        this.addSkill(new Necromancy());
    }
    getPortrait(){
        return "assets/cards/heroes/simaYi.png";
    }
}