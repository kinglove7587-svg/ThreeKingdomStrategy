// สร้าง Instance ของเกมใหม่ โดยส่ง Array ของ Object ข้อมูลผู้เล่น (Player Configs) เข้าไป
const game = new Game([
    // กำหนดผู้เล่นคนแรก: ชื่อ "เล่าปี่" ควบคุมโดยมนุษย์ (HumanController)
    {
        name: "เล่าปี่",
        controller: HumanController
    },
    // กำหนดผู้เล่นคนที่สอง: ชื่อ "เตียวหุย" ควบคุมโดยบอท (AIController)
    {
        name: "เตียวหุย",
        controller: AIController
    }
]);
// เรียกใช้เมธอด start() เพื่อเริ่มรัน Game Loop / ระบบการเล่นของเกม
game.start();

