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
        // เรียกใช้ระบบเสี่ยงทายกลางของเกม รับค่าเป็น JudgeResult
        const result = player.game.judge(player);
        // หากเปิดไม่เจอกระดาษไพ่/กองไพ่หมด ให้ยกเลิกการทำงาน
        if (!result){
            return;
        }
        // ตัวแปรเช็กสถานะว่าโดนสายฟ้าหรือไม่ (Default เป็น false)
        let hit = false;
        // ตรวจสอบว่าไพ่ที่เปิดได้เป็นดอกโพดำ (♠️) หรือไม่
        if (result.isSpade()){
            // ตรวจสอบว่าตัวเลขหน้าไพ่อยู่ในช่วง 2 ถึง 9 หรือไม่
            if (result.number >= 2 && result.number <= 9){
                // เปลี่ยนสถานะเป็นโดนสายฟ้าฟาด
                hit = true;
                player.game.log(player.name + " ถูกสายฟ้าฟาด");
                // สร้างออบเจกต์ความเสียหาย 3 หน่วย ประเภทความเสียหายสายฟ้า (source เป็น null เพราะเป็น Nature Damage)
                const damage = new Damage(null, player, 3, DamageType.THUNDER);
                // ระบุว่าการ์ดใบนี้คือต้นเหตุความเสียหาย
                damage.card = this;
                // ส่งให้ Game ประมวลผลความเสียหาย
                player.game.damage(damage);
            }
        }
        // ถอดการ์ดสายฟ้าออกจากโซนการ์ดหน่วงเวลาของตัวละคร
        player.removeDelayedTrick(this);
        if (hit){
            // นำการ์ดสายฟ้าลงกองทิ้ง (Discard Pile)
            player.game.discardPile.addCard(this);
        }else{
            // ดึงผู้เล่นคนถัดไปตามลำดับที่นั่ง
            const nextPlayer = player.game.getNextPlayerOf(player);
            // ส่งการ์ดสายฟ้าไปติดที่ผู้เล่นคนถัดไป
            nextPlayer.addDelayedTrick(this);
            player.game.log("สายฟ้าถูกส่งต่อไปยัง " + nextPlayer.name);
        }
        // อัปเดต UI การ์ดหน่วงเวลาบนหน้าจอ
        player.showDelayedTrick();
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "วางไว้หน้าผู้เล่นตัวเอง เมื่อถึง Judge เปิดไพ่ หากเป็น ♠️ 2–9 ผู้เล่นจะได้รับความเสียหายสายฟ้า 3 มิฉะนั้นสายฟ้าจะถูกส่งต่อให้ผู้เล่นคนถัดไป";
    }
}