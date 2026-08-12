class AIController extends Controller{
    // กำหนด constructor รับอินสแตนซ์ของผู้เล่น (player) เข้ามาส่งต่อให้คลาสแม่ (Controller)
    constructor(game){
        super(game);
    }
    // ประกาศเมธอด playTurn() สำหรับจัดการการทำงานในเทิร์นของ AI
    playTurn(){ 
        // ให้ AI เลือก index ของการ์ดที่จะเล่น
        const cardIndex = this.chooseCard();
        // ถ้าไม่มีการ์ดให้เล่น (ได้ค่า -1) ให้จบเทิร์นทันที
        if (cardIndex === -1){
            return false;
        }
        // เล่นการ์ดใบที่เลือกผ่านเมธอด playCard และส่งผลลัพธ์การเล่นการ์ดกลับออกไป
        return this.playCard(cardIndex);
    }
    // เมธอดสำหรับให้ AI เลือกตัดสินใจใช้การ์ดบนมือ
    chooseCard(){
        // เงื่อนไขที่ 1: ถ้าพลังชีวิต (HP) ไม่เต็ม ให้พยายามหาการ์ด "ยา" เพื่อฟื้นฟูก่อน
        if (this.player.hp < this.player.maxHp){
            // วนลูปตรวจดูการ์ดทั้งหมดบนมือของผู้เล่น
            for (let i = 0; i < this.player.hand.cards.length; i++){
                const card = this.player.hand.cards[i];
                // ถ้าเจอการ์ด "ยา" ให้ส่งคืนตำแหน่งดรรชนี (Index) ของการ์ดใบนั้นทันที
                if (card.name === "ยา"){
                    return i;
                }
            }
        }
        // เงื่อนไขที่ 2: พิจารณาเปลี่ยนอาวุธ (สนใจเฉพาะการ์ด WeaponCard ที่ระยะไกลกว่าอาวุธเดิม)
        for (let i = 0; i < this.player.hand.cards.length; i++){
            const card = this.player.hand.cards[i];
            // ข้ามการ์ดที่ไม่ใช่อาวุธ
            if (!(card instanceof WeaponCard)){
                continue;
            }
            // เลือกใช้อาวุธใหม่เฉพาะเมื่อระยะ (range) ไกลกว่าอาวุธปัจจุบันของผู้เล่น
            if (card.range > this.player.getWeaponRange()){
                return i;
            }
        }
        // เงื่อนไขที่ 3: ถ้า HP เต็ม หรือไม่มีการ์ดยา บนมือ ให้ค้นหาการ์ด "โจมตี" เพื่อโจมตี
        for (let i = 0; i < this.player.hand.cards.length; i++){
            const card = this.player.hand.cards[i];
            // ถ้าเจอการ์ด "โจมตี" ให้ส่งคืนตำแหน่งดรรชนี (Index) ของการ์ดใบนั้นทันที
            if (card.name === "โจมตี"){
                return i;
            }
        }
        // หากไม่มีการ์ดที่ตรงตามเงื่อนไขใช้งาน ให้คืนค่า -1 (จบการเลือกการ์ด)
        return -1;
    }
    // คืนผู้เล่นเป้าหมายที่ AI เลือก
    getTarget(card){
        // ตอนนี้ AI เลือกผู้เล่นคนถัดไปเป็นเป้าหมายเสมอ
        return this.game.getNextPlayer();
    }
    // สอบถามเลือกการ์ด "โจมตี"
    askSlash(player, game){
        // เรียกใช้ฟังก์ชันตัดสินใจเลือกการ์ด "โจมตี"
        return this.chooseSlash(player);
    }
    // เลือกการ์ด "โจมตี" ใบแรกที่มีในมือ
    chooseSlash(player){
        // ค้นหารายการการ์ด "โจมตี" ทั้งหมดในมือ
        const slashCards = player.hand.findSlashCards();
        // หากไม่มีการ์ด "โจมตี" ในมือเลย ให้คืนค่า -1
        if(slashCards.length === 0){
            return -1;
        }
        // คืนค่า index ของการ์ด "โจมตี" ใบแรกที่พบ
        return slashCards[0].index;
    }
    // ตรวจสอบว่าเป็น HumanController หรือไม่
    isHuman(){
        return false;
    }
    // สอบถามและค้นหาตำแหน่งการ์ด "หลบ" ในมือของผู้เล่น
    askDodge(player){
        // คืนค่าตำแหน่งดรรชนี (Index) ของการ์ด "หลบ" ที่พบในมือ (หากไม่พบจะคืนค่า -1)
        return player.hand.findCardIndexByName("หลบ");
    }
    // ค้นหาดัชนีของการ์ด "ยา" ในมือของผู้เล่น
    askPeach(player){
        return player.hand.findCardIndexByName("ยา");
    }
}
