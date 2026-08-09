class DiscardPile{
    constructor(){ // สร้างกองไพ่ทิ้ง
        this.cards = [];
    }

    addCard(card){ // เพิ่มไพ่ลงกองทิ้ง
        this.cards.push(card);
    }

    showCards(){ // แสดงไพ่ทิ้ง
        console.table(this.cards);
    }
}