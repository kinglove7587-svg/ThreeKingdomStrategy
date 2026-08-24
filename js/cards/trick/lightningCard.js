class LightningCard extends DelayedTrickCard{
    // กำหนดชื่อการ์ดเป็น "สายฟ้า" พร้อมรับดอก/สี (suit) และตัวเลขหน้าไพ่ (number)
    constructor(suit, number){
        super("สายฟ้า", suit, number);
    }
    // เช็กเงื่อนไขเป้าหมาย โดยการ์ดสายฟ้าจะวางใส่หน้าตัวเองเท่านั้น (player === target)
    canTarget(player, target){
        console.log("canTarget", player.name, target.name); // Debug
        return player === target;
    }
    // ใช้งานการ์ดสายฟ้า
    use(player, game){
        console.log("Lightning.use()"); // Debug
        // ให้ Controller เลือกเป้าหมายสำหรับการวางสายฟ้า
        const target = player.controller.getTarget(this);
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้ยกเลิกการใช้งานการ์ด
        if (target === null){
            return false;
        }
        // เพิ่มการ์ดสายฟ้าเข้าไปในโซนการ์ดหน่วงเวลา (Delayed Trick) ของเป้าหมาย
        target.addDelayedTrick(this);
        // แสดงรายการการ์ดหน่วงเวลาทั้งหมดที่ติดอยู่หน้าตัวละคร
        target.showDelayedTrick();
        game.log("→ เป้าหมาย : " + target.name);
        // คืนค่า true แสดงว่าใช้งานการ์ดสำเร็จ
        return true;
    }
    // ประมวลผลช่วงเสี่ยงทาย (Judge Phase) ของการ์ดสายฟ้า
    onJudge(player){
        player.game.log(player.name + " เริ่ม Judge สายฟ้า");
        // ให้ Judge Engine เรียกส่วนประมวลผลเมื่อ Judge พร้อมแล้ว
        player.game.judge(
            player, 
            (result) => {
                // ตัวแปรเช็กสถานะว่าโดนสายฟ้าหรือไม่
                let hit = false;
                // ตรวจสอบว่าไพ่ที่เปิดได้เป็นดอกโพดำ
                if(result.isSpade()){
                    // ตรวจสอบเลข 2 ถึง 9
                    if(result.number >= 2 && result.number <= 9){
                        hit = true;
                        player.game.log(player.name + " ถูกสายฟ้าฟาด");
                        // สร้าง Damage ตามระบบเดิม
                        const damage = new Damage(null, player, 3, DamageType.THUNDER);
                        // ระบุการ์ดต้นเหตุ
                        damage.card = this;
                        // ยังคงผ่าน Damage Pipeline เดิม
                        player.game.damage(damage);
                    }
                }
                // ถอดสายฟ้าออกจากผู้เล่น
                player.removeDelayedTrick(this);
                if(hit){
                    // โดนสายฟ้า → ลงกองทิ้ง
                    player.game.discardPile.addCard(this);

                }else{
                    // ไม่โดน → ส่งต่อผู้เล่นถัดไป
                    const nextPlayer = player.game.getNextPlayerOf(player);
                    nextPlayer.addDelayedTrick(this);
                    player.game.log("สายฟ้าถูกส่งต่อไปยัง " + nextPlayer.name);
                }
                player.showDelayedTrick();
            }
        );
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "วางไว้หน้าผู้เล่นตัวเอง เมื่อถึง Judge เปิดไพ่ หากเป็น ♠️ 2 – 9 ผู้เล่นจะได้รับความเสียหายสายฟ้า 3 มิฉะนั้นสายฟ้าจะถูกส่งต่อให้ผู้เล่นคนถัดไป";
    }
}