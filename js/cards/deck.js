class Deck {
    constructor() {
        this.cards = []; // สร้างการ์ด
        this.initDeck(); // เพิ่มการ์ด ลง กอง
    }

    initDeck() { // เพิ่มการ์ดลง Deck
        for (let i = 0; i <= 4; i++){ // วนลูป การ์ด 3 ใบ 4 รอบ
            this.cards.push(new SlashCard("♠️", 1)); // เพิ่มการ์ดฆ่า
            this.cards.push(new SlashCard("♥️", 7, DamageType.FIRE)); // การ์ดฆ่าไฟ
            this.cards.push(new SlashCard("♠️", 12, DamageType.THUNDER)); // การ์ดฆ่าสายไฟ
            this.cards.push(new DodgeCard("♥️", 2)); // เพิ่มการ์ดหลบ
            this.cards.push(new PeachCard("♣️", 3)); // เพิ่มการ์ดยา
            this.cards.push(new TrainingSword("♦️", 5)); // เพิ่มอาวุธ กระบี่ฝึกหัด
            this.cards.push(new CrossbowCard("♠️", 2)); // เพิ่มอาวุธ หน้าไม้จูเก่อ
            this.cards.push(new EightTrigramsArmor("♣️", 2)); // เพิ่มเกราะแปดทิศ
            this.cards.push(new LeBuSiShuCard("♠️", 6)); // เพิ่มการ์ดหน่วงเวลา สุราลืมกลับ
            this.cards.push(new LightningCard("♠️", 2)); // เพิ่มการ์ดหน่วงเวลา สายฟ้า
            this.cards.push(new FireAttackCard("♥️", 8)); // เพิ่มการ์ดกลอุบาย เพลิงผลาญ
            this.cards.push(new TengJiaArmor("♣️", 7)); // เพิ่มอุปกรณ์เกราะ เกราะหวาย
            this.cards.push(new IronChainCard("♣️", 12)); // การ์ดโซ่ตรวน
            this.cards.push(new DuelCard("♠️", 1)); // การ์ดดวลเดียว
            this.cards.push(new WineCard("♦️", 9)); // การ์ด สุรา
            this.cards.push(new SomethingOutOfNothingCard("♥️", 7)); // การ์ดกลอุบาย บังเกิดมีสิ่ง
        }
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
}
