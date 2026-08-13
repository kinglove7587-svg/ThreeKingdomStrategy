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
        controller: AIController//HumanController//
    },
    //
    {
        hero: TestHero, 
        name: "ทดสอบ", 
        controller: AIController
    }
]);
// เรียกใช้เมธอด start() เพื่อเริ่มรัน Game Loop / ระบบการเล่นของเกม
game.start();

