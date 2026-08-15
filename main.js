// Instance ของเกม โดยกำหนดข้อมูลฮีโร่ ชื่อผู้เล่น และชนิด Controller ของแต่ละคน
const game = new Game([
    // ผู้เล่นคนที่ 1: ใช้ฮีโร่เล่าปี่ และควบคุมโดยมนุษย์
    {
        hero: LiuBei, 
        name: "เล่าปี่", 
        controller: HumanController//AIController//
    },
    // ผู้เล่นคนที่ 2: ใช้ฮีโร่เตียวหุย และควบคุมโดย AI
    {
        hero: ZhangFei, 
        name: "เตียวหุย", 
        controller: HumanController//AIController//
    },
    //
    {
        hero: TestHero, 
        name: "AI 01", 
        controller: AIController
    }
]);

// NEW: เปิดใช้งานเครื่องมือทดสอบผ่าน Console
game.debug = new DebugTools(game);

// เรียกใช้เมธอด start() เพื่อเริ่มรัน Game Loop / ระบบการเล่นของเกม
game.start();

