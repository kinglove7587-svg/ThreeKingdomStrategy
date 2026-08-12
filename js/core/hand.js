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
    // คืนค่าออบเจกต์การ์ดใบแรกที่มีดอก (Suit) ตรงกับที่ระบุ
    findCardBySuit(suit){
        // วนลูปตรวจการ์ดทุกใบในมือ
        for (const card of this.cards){
            // ถ้าพบการ์ดที่มีดอกตรงกัน ให้ส่งคืนการ์ดนั้นทันที
            if (card.suit === suit){
                return card;
            }
        }
        // หากไม่พบการ์ดดอกที่ต้องการ ให้คืนค่า null
        return null;
    }
    // คืนค่า Index (ตำแหน่ง) ของการ์ดใบแรกที่มีดอก (Suit) ตรงกับที่ระบุ
    findCardIndexBySuit(suit){
        // วนลูปตามจำนวนการ์ดในมือ
        for (let i = 0; i < this.cards.length; i++){
            // ถ้าพบการ์ดที่มีดอกตรงกัน ให้ส่งคืนตำแหน่ง Index นั้น
            if (this.cards[i].suit === suit){
                return i;
            }
        }
        // หากไม่พบการ์ดดอกที่ต้องการ ให้คืนค่า -1
        return -1;
    }
    // ค้นหาการ์ดประเภท "โจมตี" (SlashCard) ทั้งหมดที่มีในมือ
    findSlashCards(){
        // สร้างอาร์เรย์สำหรับเก็บผลลัพธ์การ์ดที่ค้นพบ
        const result = [];
        // วนลูปตรวจการ์ดทีละใบในมือ
        for(let i = 0; i < this.cards.length; i++){
            // ดึงข้อมูลการ์ดในตำแหน่งปัจจุบัน
            const card = this.cards[i];
            // ตรวจสอบว่าเป็นการ์ดประเภท "โจมตี" หรือไม่
            if(card instanceof SlashCard){
                // บันทึกตำแหน่ง (index) และออบเจกต์การ์ดเข้าอาร์เรย์ผลลัพธ์
                result.push({
                    index: i, 
                    card: card
                });
            }
        }
        return result;
    }
    //
    findCardIndexByName(cardName){
        return this.cards.findIndex(card => card.name === cardName);
    }
}