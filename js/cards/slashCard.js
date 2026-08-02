class SlashCard extends Card { // SlashCard สืบทอดจาก Card
    constructor(suit, number){
        super("Basic", "ฆ่า", suit, number); // เรียก constructor ของ Card
    }
    // Override ความสามารถของการ์ด
    use(player, game){ 
        // เช็กว่าผู้เล่นคนนี้ใช้การ์ดฆ่าในเทิร์นนี้ไปแล้วหรือยัง (ผ่านเมธอด canUseSlash)
        if (!player.canUseSlash()){
            // หากใช้ไปแล้ว ให้แสดงข้อความแจ้งเตือนใน Console
            console.log(player.name + " ใช้ฆ่าไปแล้ว ");
            // ไม่อนุญาตให้ใช้งานการ์ด ส่งค่า false กลับออกไป
            return false;
        }
        // ดึงผู้เล่นเป้าหมายจาก Controller ของผู้เล่นผ่านเมธอด getTarget() แบบ Polymorphism
        const target = player.controller.getTarget(this);
        // ถ้ายังไม่ได้เลือกเป้าหมาย ให้แสดงข้อความแจ้งเตือนและยกเลิกการใช้การ์ด
        if (target === null){
            console.log("ยังไม่ได้เลือกเป้าหมาย");
            return false;
        }
        // บันทึกสถานะว่าผู้เล่นคนนี้ได้ใช้งานการ์ดฆ่าเรียบร้อยแล้ว (ผ่านเมธอด markSlashUsed)
        player.markSlashUsed();
        console.log(player.name + " ใช้การ์ดฆ่า " + target.name); // แสดงผู้โจมตี

        if (target.hand.hasCard("หลบ")){ // ถ้ามีการ์ดหลบ
            const dodgeCard = target.hand.removeCardByName("หลบ"); // เอาการ์ดหลบออกจากมือ
            game.discardPile.addCard(dodgeCard); // ย้ายหลบไปกองทิ้ง
            console.log(target.name + " มีการ์ดหลบ ");  // แจ้งว่าหลบได้
            target.showHand(); // อัปเดตไพ่ในมือ
            game.showDiscardPile(); // อัปเดตกองทิ้ง
        }
        else{
            console.log(target.name + " ไม่มีการ์ดหลบ "); // แจ้งว่าหลบไม่ได้
            // สร้างออบเจกต์เก็บข้อมูลความเสียหาย (ระบุผู้ใช้, เป้าหมาย, และจำนวนดาเมจ 1 หน่วย)
            const damage = new Damage(player, target, 1);
            // ส่งออบเจกต์ความเสียหายให้ Game เป็นศูนย์กลางประมวลผล
            game.damage(damage);
        }
        return true;
    }
    // การ์ดใบนี้จำเป็นต้องเลือกเป้าหมายก่อนใช้งาน (เช่น การ์ด ฆ่า / Slash)
    needTarget(){
        return true;
    }
    // ตรวจสอบว่าสามารถเลือกผู้เล่นคนนี้เป็นเป้าหมายของการ์ด "ฆ่า" ได้หรือไม่
    canTarget(player, target){
        // เงื่อนไขที่ 1: ห้ามเลือกตัวเองเป็นเป้าหมาย
        if (player === target){
            return false;
        }
        // เงื่อนไขที่ 2: คำนวณระยะห่างระหว่างผู้ใช้การ์ดกับเป้าหมายผ่านระบบ Distance ของเกม
        const distance = player.game.getDistance(player, target);
        // เงื่อนไขที่ 3: ถ้าระยะห่างจริง ไกลกว่าระยะการโจมตีจากอาวุธที่ผู้เล่นถืออยู่ จะไม่สามารถตกเป็นเป้าหมายได้
        if (distance > player.getWeaponRange()){
            return false;
        }
        return true;
    }
}