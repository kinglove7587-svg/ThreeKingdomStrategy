class Rende extends ActiveSkill{ 
    // กำหนด constructor สืบทอดจาก ActiveSkill และระบุชื่อสกิล "Rende" (จิตเมตตา)
    constructor(){
        super("Rende"); // จิตเมตตา
        // จำนวนครั้งที่ใช้ในเทิร์นนี้
        this.usedCount = 0;
    }
    // เริ่มเทิร์นใหม่ รีเซ็ตจำนวนครั้งที่ใช้
    onTurnStart(player, game){
        this.usedCount = 0;
    }
    // ใช้ได้เมื่อยังไม่ครบ 2 ครั้ง และมีไพ่ในมือ
    canUse(player, game){
        return(
            this.usedCount < 2 &&
            player.hand.cards.length > 0
        );
    }
    // ฟังก์ชันการทำงานเมื่อกดใช้สกิล Rende
    use(player, game){
        // เช็กก่อนว่าผ่านเงื่อนไขการใช้งานหรือไม่ หากไม่มีไพ่ในมือให้ยกเลิกการทำงาน
        if (!this.canUse(player, game)){
            return false;
        }
        // ค้นหาผู้เล่นคนถัดไปที่จะเป็นเป้าหมายรับไพ่
        const target = game.getNextPlayer(); // Version 1 : ส่งให้ผู้เล่นคนถัดไปอัตโนมัติ
        // ดึงการ์ดใบแรก (index ที่ 0) ออกมาจากมือของผู้เล่น
        const card = player.hand.removeCard(0);
        // เช็กความปลอดภัย หากดึงไพ่ไม่ได้ (ได้ค่า null) ให้ยกเลิกการทำงาน
        if (card === null){
            return false;
        }
        // นำการ์ดใบนั้นย้ายเข้าไปใส่ไว้ในมือของผู้เล่นเป้าหมาย
        target.hand.addCard(card);
        // เพิ่มจำนวนครั้งที่ใช้งานสกิลสะสมขึ้นไปอีก 1 ครั้ง
        this.usedCount++;
        // แสดง Log การใช้สกิล รายชื่อการ์ดที่มอบ และผู้รับ
        game.log(
            player.name + 
            " ใช้สกิล Rende (จิตเมตตา) มอบ " + 
            card.name + 
            " ให้ " +
            target.name
        );
        // แสดงรายการไพ่ในมือล่าสุดของผู้ใช้สกิลและผู้รับ
        player.showHand();
        target.showHand();
        // ส่งค่า true กลับไปเมื่อส่งมอบไพ่สำเร็จ
        return true;
        
    }
}