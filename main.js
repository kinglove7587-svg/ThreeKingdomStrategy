// Instance ของเกม โดยกำหนดข้อมูลฮีโร่ ชื่อผู้เล่น และชนิด Controller ของแต่ละคน
const game = new Game([
    {
        hero: GuanYu, 
        controller: HumanController//AIController//
    },
    {
        hero: SimaYi, 
        controller: HumanController//AIController//
    },
    {
        hero: LiuBei, 
        controller: HumanController//AIController
    }
]);

// NEW: เปิดใช้งานเครื่องมือทดสอบผ่าน Console
game.debug = new DebugTools(game);

// เรียกใช้เมธอด start() เพื่อเริ่มรัน Game Loop / ระบบการเล่นของเกม
game.start();

