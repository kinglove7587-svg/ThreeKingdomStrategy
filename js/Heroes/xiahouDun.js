class XiahouDun extends Player{

    constructor(game, controllerClass){
        super("แฮหัวตุ้น", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Stauchness (หาญกล้า)\n" +
            "หลังจากคุณได้รับความเสียหาย คุณสามารถเข้าสู่การ จั่วการ์ดตัดสินได้ " +
            "หากไพ่ จั่วตัดสิน ไม่ใช่ ♥️ ผู้สร้างความเสียหายต้องเลือก " +
            "ทิ้งการ์ดในมือ 2 ใบ หรือรับความเสียหาย 1 หน่วยจากคุณ";

        this.addSkill(new Stauchness());

        this.equipMount(new ShadowrunnerCard("♣️", 7));
    }
}