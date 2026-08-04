class JudgeResult{
    // รับออบเจกต์การ์ดที่ถูกใช้ในการเสี่ยงทาย (Judge) เข้ามาเก็บไว้
    constructor(card){
        this.card = card; 
    }
    // ดึงข้อมูลดอกไพ่ (Suit)
    get suit(){
        return this.card.suit;
    }
    // ดึงข้อมูลตัวเลข/แต้มไพ่ (Number)
    get number(){
        return this.card.number;
    }
    // ตรวจสอบว่าเป็นดอกหัวใจ (Heart) หรือไม่
    isHeart(){
        return this.card.suit === "♥️";
    }
    // ตรวจสอบว่าเป็นดอกโพดำ (Spade) หรือไม่
    isSpade(){
        return this.card.suit === "♠️";
    }
    // ตรวจสอบว่าเป็นดอกดอกจิก (Club) หรือไม่
    isClub(){
        return this.card.suit === "♣️";
    }
    // ตรวจสอบว่าเป็นดอกข้าวหลามตัด (Diamond) หรือไม่
    isDiamond(){
        return this.card.suit === "♦️";
    }
}