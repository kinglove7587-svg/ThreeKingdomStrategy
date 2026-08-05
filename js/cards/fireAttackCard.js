class FireAttackCard extends TrickCard{
    // ตัวสร้างออบเจกต์การ์ดกลอุบาย "เพลิงผลาญ" (Fire Attack)
    constructor(suit, number){
        super("เพลิงผลาญ", suit, number);
    }
    // ระบุว่าการ์ดใบนี้จำเป็นต้องเลือกเป้าหมายในการใช้งาน
    needTarget(){
        return true;
    }
    // เงื่อนไขตรวจสอบว่าเป้าหมายสามารถถูกตกเป็นเป้าของการ์ดใบนี้ได้หรือไม่
    canTarget(player, target){
        // ไม่อนุญาตให้ใช้ใส่ตัวเอง
        if (player === target){
            return false;
        }
        // เป้าหมายต้องมีไพ่บนมืออย่างน้อย 1 ใบ
        if (target.hand.cards.length === 0){
            return false;
        }
        // ผ่านเงื่อนไขทั้งหมด สามารถเลือกเป้าหมายได้
        return true;
    }
    // ประมวลผลการใช้งานการ์ดเพลิงผลาญ
    use(player){
        // ดึงออบเจกต์เกมจากตัวละครผู้ใช้
        const game = player.game;
        // ดึงเป้าหมายที่เลือกผ่าน Controller
        const target = player.controller.getTarget(this);
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้ยกเลิกการทำงานของการ์ด
        if (!target){
            return false;
        }
        game.log("→ เป้าหมาย : " + target.name);
        // ให้เป้าหมายเปิดเผยการ์ดบนมือ 1 ใบ
        const revealCard = target.revealHandCard();
        // หากไม่มีการ์ดเปิดเผย (เช่น ไพ่ในมือเป้าหมายหมด) ให้ยกเลิกการทำงาน
        if (!revealCard){
            return false;
        }
        game.log(target.name + " เปิดเผย " + revealCard.name + " " + revealCard.suit);
        // ค้นหาตำแหน่งการ์ดในมือของผู้ใช้ที่มีดอก (Suit) เดียวกับใบที่เปิดเผย
        const index = player.hand.findCardIndexBySuit(revealCard.suit);
        // หากไม่มีการ์ดดอกเดียวกัน ให้ลง Log และจบการทำงาน
        if (index === -1){
            game.log(player.name + " ไม่มีไพ่ดอกเดียวกัน " + revealCard.suit);
            return true;
        }
        // นำการ์ดดอกเดียวกันออกจากมือของผู้ใช้
        const discardCard = player.hand.removeCard(index);
        // นำการ์ดลงกองทิ้ง (Discard Pile)
        game.discardPile.addCard(discardCard);
        game.log(player.name + " ทิ้ง " + discardCard.name + " " + discardCard.suit);
        // สร้างออบเจกต์ความเสียหายธาตุไฟ (Fire Damage) จำนวน 1 หน่วย
        const damage = new Damage(player, target, 1, DamageType.FIRE);
        // ระบุว่าความเสียหายนี้มาจากไพ่ใบนี้ (เพื่ออ้างอิงกับสกิล/อุปกรณ์อื่นในอนาคต)
        damage.card = this;
        // ประมวลผลสร้างความเสียหายใส่เป้าหมาย
        game.damage(damage);
        // ให้ผู้ใช้เลือกทิ้งการ์ดดอกเดียวกัน
        return true;
    }
}