// Instance ของเกม โดยกำหนดข้อมูลฮีโร่ ชื่อผู้เล่น และชนิด Controller ของแต่ละคน
const game = new Game([
    {
        hero: LiuBei, 
        controller: HumanController//AIController//
    },
    {
        hero: ZhangLiao, 
        controller: HumanController//AIController//
    },
    {
        hero: SimaYi, 
        controller: HumanController//AIController
    },
    {
        hero: DiaoChan, 
        controller: HumanController//AIController
    },
    {
        hero: XiahouDun, 
        controller: HumanController//AIController
    }
]);

// NEW: เปิดใช้งานเครื่องมือทดสอบผ่าน Console
game.debug = new DebugTools(game);

// เรียกใช้เมธอด start() เพื่อเริ่มรัน Game Loop / ระบบการเล่นของเกม
game.start();
// CaoCao LuBu GuanYu XiahouDun SimaYi LiuBei ZhangFei SunQuan HuaTuo GanNing LuMeng DiaoChan
// ZhangLiao 
