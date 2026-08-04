class Deck {
    constructor() {
        this.cards = []; // สร้างการ์ด
        this.initDeck(); // เพิ่มการ์ด ลง กอง
    }

    initDeck() { // เพิ่มไพ่ลง Deck
        for (let i = 0; i <= 4; i++){ // วนลูป การ์ด 3 ใบ 4 รอบ
            this.cards.push(new SlashCard("♠️", 1)); // เพิ่มการ์ดฆ่า
            //this.cards.push(new Card("Basic", "หลบ", "♥️", 2));
            this.cards.push(new PeachCard("♣️", 3)); // เพิ่มการ์ดยา
            this.cards.push(new TrainingSword("♦️", 5));
            this.cards.push(new CrossbowCard("♠️", 2));
            this.cards.push(new EightTrigramsArmor("♣️", 2));
            this.cards.push(new LeBuSiShuCard("♠️", 6));
        }
        // เพิ่มการ์ดประเภทอุปกรณ์ / อาวุธ (SwordCard) ท้ายกอง
        this.cards.push(new SwordCard("♠️",5));
    }
    // สับไพ่
    shuffle() {
        for(let i = this.cards.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));

            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    // จั่วไพ่
    draw() {
        if(this.cards.length === 0){ // ตรวจสอบ ไพ่ในกอง มีเหลือไหม
            console.log("ไพ่ในกองหมด"); // ถ้าหมดในแสดงข้อความ และ คืนค่า
            return null;
        }
        return this.cards.pop(); // ถ้ามี นำใบบนสุด ให้ผู้เล่น
    }
    // จั่วการ์ดใบบนสุดออกจากกองไพ่
    drawTopCard(){
        // หากไม่มีการ์ดเหลือในกอง ให้คืนค่า null
        if (this.cards.length === 0){
            return null;
        }
        // ดึงและคืนค่าการ์ดใบบนสุด (ท้ายอาร์เรย์) ออกจากกอง
        return this.cards.pop();
    }
}
