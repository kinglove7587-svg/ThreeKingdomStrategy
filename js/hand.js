class Hand{
    constructor(){
        this.cards = []; // สร้าง Array ว่างไว้เก็บไพ่
    }

    addCard(card){ // รับไพ่ 1 ใบ แล้วใส่เข้าไปในมือ
        this.cards.push(card);
    }

    removeCard(index){ // นำไพ่ผู้เล่นออกจากมือ ตามลำดับ
        if (index < 0 || index >= this.cards.length){ //ตรวจ ลำดับ ที่ส่งมา
            return null;
        }
        return this.cards.splice(index, 1)[0]; // ลบไพ่ออกจาก ลำดับ 1 ใบ 
    }

    showCards(){ // แสดงไพ่ในมือ
        console.table(this.cards);
    }

    hasCard(cardName){ // ตรวจสอบว่ามีการ์ดชื่อที่ต้องการหรือไม่
        return this.cards.some(card => card.name === cardName); // คืน true หรือ false
    }

    removeCardByName(cardName){ // ลบการ์ดตามชื่อ 
        const index = this.cards.findIndex(card => card.name === cardName); // หาลำดับชื่อการ์ดที่ตรงกัน
        
        if (index === -1){ // ถ้าไม่เจอ คืนค่า null
            return null;
        }
        return this.cards.splice(index, 1)[0]; // ลบแล้วคืนการ์ด
    }
}