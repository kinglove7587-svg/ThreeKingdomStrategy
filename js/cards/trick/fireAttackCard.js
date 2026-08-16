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
        // พบไพ่ดอกเดียวกัน
        const discardCard = player.hand.cards[index];
        game.log(player.name + " มีไพ่ดอกเดียวกัน " + revealCard.suit);
        // ถามผู้เล่นว่าจะทิ้งหรือไม่
        player.controller.startTriggerChoice(this, 
            {
                card: discardCard, 
                target: target, 
                revealCard: revealCard
            }
        );
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เลือกผู้เล่นอื่นที่มีการ์ดบนมือ เป้าหมายเปิดไพ่ 1 ใบ หากคุณมีการ์ดดอกเดียวกัน ให้ทิ้ง 1 ใบเพื่อสร้างความเสียหายไฟ 1";
    }
    // ประมวลผลผลลัพธ์หลังจากผู้เล่นเลือก "ใช้" หรือ "ไม่ใช้" สกิลเพลิงผลาญ
    resolveChoice(player, game, context, useSkill){
        // หากผู้เล่นเลือกไม่ใช้ (useSkill = false)
        if(!useSkill){
            game.log(player.name + " ไม่ใช้ เพลิงผลาญ");
            return false;
        }
        // เปลี่ยนไปเลือกการ์ดที่จะทิ้งจริง
        player.controller.startTriggerCardSelection(this, context);
        return true;
    }
    // ตรวจสอบว่าการ์ดที่เลือกบนมือผู้เล่น มีดอก (Suit) ตรงกับการ์ดที่ฝ่ายตรงข้ามเปิดเผยหรือไม่
    canSelectTriggerCard(player, card, context){

        if(!card){
            return false;
        }

        if(!context || !context.revealCard){
            return false;
        }
        return card.suit === context.revealCard.suit;
    }
    // จัดการเมื่อผู้เล่นยกเลิกการเลือกการ์ด Trigger (เลือกไม่ใช้เพลิงผลาญ)
    cancelTriggerCardSelection(player, game, context){
        game.log(player.name + " ไม่ใช้ เพลิงผลาญ");
        return true;
    }
    // ประมวลผลเมื่อเลือกการ์ดสำเร็จ ทิ้งการ์ดลงกอง และทำความเสียหายธาตุไฟ 1 แต้มใส่เป้าหมาย
    resolveTriggerCards(player, game, context){
        // ตรวจสอบว่าเลือกการ์ดถูกต้อง 1 ใบหรือไม่
        if(!context.cards || context.cards.length !== 1){
            return false;
        }

        const card = context.cards[0];
        // ตรวจสอบเงื่อนไขดอกไพ่ซ้ำอีกครั้งเพื่อความปลอดภัย
        if(!this.canSelectTriggerCard(player, card, context)){
            return false;
        }
        // ค้นหาตำแหน่งการ์ดในมือ
        const index = player.hand.cards.indexOf(card);
        if(index === -1){
            return false;
        }
        // ดึงการ์ดออกจากมือผู้เล่น
        const discardCard = player.hand.removeCard(index);
        if(!discardCard){
            return false;
        }
        // นำลงกองทิ้งและลง Log
        game.discardPile.addCard(discardCard);
        game.log(player.name + " ทิ้ง " + discardCard.name + " " + discardCard.suit);
        // สร้างความเสียหายธาตุไฟ 1 แต้มใส่เป้าหมาย
        const damage = new Damage(player, context.target, 1, DamageType.FIRE);
        damage.card = this;
        game.damage(damage);
        return true;
    }
}