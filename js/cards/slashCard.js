class SlashCard extends Card { // SlashCard สืบทอดจาก Card
    constructor(suit, number){
        super("Basic", "ฆ่า", suit, number); // เรียก constructor ของ Card
    }
    // Override ความสามารถของการ์ด
    use(player, game){ 
        // สร้าง Context สำหรับเช็กเงื่อนไขการใช้การ์ดฆ่า
        const context = {
            player : player, 
            allow : player.canUseSlash()
        };
        // ส่ง Event ก่อนใช้การ์ดฆ่า เปิดโอกาสให้ Trigger Skill
        game.eventManager.emit("beforeUseSlash", context);
        console.log("allow =", context.allow);
        // ตรวจสอบสิทธิ์การใช้งานจาก context.allow
        if (!context.allow){
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
        // สร้าง Context สำหรับระบบประมวลผลการหลบ (เก็บผู้โจมตี, เป้าหมาย, และสถานะการหลบ)
        const dodgeContext = {
            attacker: player, 
            target: target, 
            dodge: false
        };
        console.log(player.name + " ใช้การ์ดฆ่า " + target.name); // แสดงผู้โจมตี
        // เปิดโอกาสให้สกิลต่างๆ แทรกการทำงานก่อนตรวจสอบการ์ดหลบ
        game.eventManager.emit("beforeDodge", dodgeContext);
        // ตรวจสอบเงื่อนไขการหลบจากสกิลก่อนเป็นอันดับแรก
        if (dodgeContext.dodge){
            game.log(target.name + " หลบการโจมตี"); 
        // หากไม่ได้หลบด้วยสกิล ให้ตรวจสอบการ์ดหลบในมือต่อ
        }else if (target.hand.hasCard("หลบ")){ // ถ้ามีการ์ดหลบ
            const dodgeCard = target.hand.removeCardByName("หลบ"); // เอาการ์ดหลบออกจากมือ
            game.discardPile.addCard(dodgeCard); // ย้ายหลบไปกองทิ้ง
            console.log(target.name + " มีการ์ดหลบ ");  // แจ้งว่าหลบได้
            target.showHand(); // อัปเดตไพ่ในมือ
            game.showDiscardPile(); // อัปเดตกองทิ้ง
        }else{
            console.log(target.name + " ไม่มีการ์ดหลบ "); // แจ้งว่าหลบไม่ได้
            // สร้างออบเจกต์เก็บข้อมูลความเสียหาย (ระบุผู้ใช้, เป้าหมาย, และจำนวนดาเมจ 1 หน่วย)
            const damage = new Damage(player, target, 1);
            // สร้าง Context ตรวจสอบการถูกโจมตีด้วย Slash
            const context = {
                source: player, 
                target: target, 
                card: this, 
                canceled: false
            };
            // ส่ง Event ก่อนการโจมตีโดนเป้าหมาย
            game.eventManager.emit("beforeSlashHit", context);
            // หากมีการยกเลิกการโจมตี
            if (context.canceled){
                game.log(target.name + " ป้องกันการโจมตี");
                return true;
            }
            // บันทึกว่าดาเมจนี้เกิดจากการ์ดใบไหน
            damage.card = this;
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