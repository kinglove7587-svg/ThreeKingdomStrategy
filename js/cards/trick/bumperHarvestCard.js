class BumperHarvestCard extends TrickCard{
    constructor(suit, number){
        super("เก็บเกี่ยวอุดมสมบูรณ์", suit, number);
    }
    // เรียกใช้ระบบ Bumper Harvest กลางโต๊ะเมื่อกดใช้การ์ดใบนี้
    use(player, game){
        // เรียกเริ่มระบบ Bumper Harvest ใน Engine หลัก
        game.startBumperHarvest();
        return true;
    }
}