class XuZhu extends Player{

    constructor(game, controllerClass){
        super("เคาทู", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Bared Bodied (เปลือยกาย)\n" +
            "ใน Draw Phase คุณอาจเลือกจั่วการ์ดน้อยลง 1 ใบ " +
            "หากทำเช่นนั้น โจมตี หรือ ดวลเดี่ยว ที่คุณใช้ในเทิร์นนี้ " +
            "จะสร้างความเสียหายเพิ่ม 1 หน่วย";

        this.addSkill(new BaredBodied());
    }
    getPortrait(){
        return "assets/cards/heroes/XuZhu.png";
    }
}