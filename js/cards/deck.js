class Deck {
    constructor() {
        this.cards = []; // สร้างการ์ด
        this.initDeck(); // เพิ่มการ์ด ลง กอง
    }

    initDeck() { // เพิ่มการ์ดลง Deck
        for (let i = 0; i <= 4; i++){ // วนลูป การ์ด 3 ใบ 4 รอบ
            //============================= Basic Card ================================
            this.cards.push(new SlashCard("♥️", 10)); // เพิ่มการ์ดโจมตี
            this.cards.push(new SlashCard("♥️", 4, DamageType.FIRE)); // การ์ดโจมตีไฟ
            this.cards.push(new SlashCard("♣️", 5, DamageType.THUNDER)); // การ์ดสายฟ้า
            this.cards.push(new DodgeCard("♥️", 2)); // เพิ่มการ์ดหลบ
            this.cards.push(new PeachCard("♥️", 3)); // เพิ่มการ์ดยา
            this.cards.push(new WineCard("♠️", 9)); // การ์ด สุรา
            //============================ Delayed Card ================================
            this.cards.push(new LightningCard("♥️", 12)); // เพิ่มการ์ดหน่วงเวลา สายฟ้า
            this.cards.push(new LeBuSiShuCard("♠️", 6)); // เพิ่มการ์ดหน่วงเวลา สุราลืมกลับ
            this.cards.push(new RationsDepletedCard("♣️", 4)); // การ์ดหน่วงเวลา เสบียงหมด!
            //============================= TrickCard ==================================
            this.cards.push(new PeachGardenCard("♥️", 1)); // การ์ดอุบาย คำสาบานสวนท้อ
            this.cards.push(new KnowEnemyCard("♣️", 3)); // การ์ดอุบาย รู้เขารู้เรา *ยังไม่เสร็จ
            this.cards.push(new BurnBridgeCard("♥️", 12)); // การ์ดอุบาย ถอนสะพาน
            this.cards.push(new BarbarianCard ("♣️", 7)); // การ์ดอุบาย กองทัพต่างแดน
            this.cards.push(new RainingArrowsCard("♥️", 1)); // การ์ดอุบาย ฝนธนู
            this.cards.push(new SomethingOutOfNothingCard("♥️", 7)); // การ์ดกลอุบาย บังเกิดมีสิ่ง
            this.cards.push(new DuelCard("♦️", 1)); // การ์ด ดวลเดียว
            this.cards.push(new StealCard("♠️", 3)); // การ์ดกลอุบาย ฉกฉวย *ยังไม่เสร็จ
            this.cards.push(new FireAttackCard("♥️", 2)); // เพิ่มการ์ดกลอุบาย เพลิงผลาญ
            this.cards.push(new IronChainCard("♣️", 13)); // การ์ดอุบาย โซ่ตรวน
            this.cards.push(new BarbarianCard ("♣️", 7)); // การ์ดอุบาย กองทัพต่างแดน
            this.cards.push(new BumperHarvestCard("♥️", 3)); // การ์ดอุบาย เก็บเกี่ยวอุดมสมบูรณ์
            //============================= Weapon ======================================
            this.cards.push(new TrainingSword("♦️", 5)); // เพิ่มอาวุธ กระบี่ฝึกหัด
            this.cards.push(new CrossbowCard("♠️", 2)); // เพิ่มอาวุธ หน้าไม้จูเก่อ
            this.cards.push(new SerpentSpearCard("♠️", 12)); // ง้าวอสรพิษ
            this.cards.push(new KirinBowCard("♥️", 5)); // กิเลนคันธนู
            this.cards.push(new TwoBladedTridentCard("♦️", 12)); // ง้าวสามคม
            //============================= Armor ======================================
            this.cards.push(new EightTrigramsArmor("♣️", 2)); // เพิ่มเกราะเกราะแปดทิศ         
            this.cards.push(new TengJiaArmor("♣️", 7)); // เพิ่มอุปกรณ์เกราะ เกราะหวาย
            //============================= Mount ======================================
            this.cards.push(new FerganaSteedCard("♠️", 13)); // การ์ด ม้าต้าหยวน
            this.cards.push(new ShadowrunnerCard("♠️", 5)); // การ์ด ม้าเงาพยับ
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
/*
2. Negation
3. Alliance
4. Rest and Reorganization
5. Borrowed Sword*/
