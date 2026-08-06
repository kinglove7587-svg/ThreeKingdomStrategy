class Player{
    constructor(name, game, controllerClass = AIController){
        this.name = name; // ชื่อ player
        this.game = game; // บันทึกออบเจกต์ของเกม game เข้ามาเก็บไว้ในตัวละครผู้เล่น เพื่อใช้เข้าถึง EventManager ของเกม
        this.maxHp = 4; // เลือดสูงสุด
        this.hp = 4; // เลือดปัจจุบัน
        this.hand = new Hand(); // สร้างไพ่ในมือ player
        this.slashUsed = false; // เช็กการใช้การ์ดฆ่า
        this.skills = []; // เก็บสกิล
        this.controller = new controllerClass(game); // ผูก controllerClass เข้ากับ game
        this.controller.setPlayer(this); // ผูก player (this) เข้ากับ Controller ใบนั้น
        this.weapon = null; // อาวุธ
        this.armor = null; // เกราะ
        this.infiniteSlash = false;
        this.delayedTricks = []; // เก็บการ์ดหน่วงเวลาที่ติดอยู่
        this.skipPlayPhase = false; // Flag สำหรับข้าม Play Phase เมื่อติดผลสุราลืมกลับ
        this.chained = false; // สถานะติดโซ่ตรวน (Iron Chain)
    }

    drawCard(deck){ // player จั่วกองไพ่
        const card = deck.draw(); // เอาไพ่ออกจากกอง 1 ใบ

        if (card !== null){ // ถ้าไม่ใช่ null แปลว่ายังมีไพ่
            this.hand.addCard(card); // เอาไพ่ใบนั้นเข้าไปไว้ในมือ
        }
    }

    showHand(){  // แสดงไพ่ในมือของ player
        console.log(this.name + "ไพ่ในมือ");
        this.hand.showCards();
    }

    takeDamage(amount){
        //
        this.loseHp(amount);
    }

    heal(amount){ // ฟื้นฟู HP
        this.recoverHp(amount);
    }

    showStatus(){ // แสดงสถานะผู้เล่น
        console.log(this.name + "HP : " + this.hp + "/" + this.maxHp);
    }

    loseHp(amount = 1){ // รับค่าจำนวน HP ที่ต้องลด
        this.hp -= amount;

        if (this.hp < 0){ // ทำการลด HP ของผู้เล่น และคุมไม่ให้ HP ต่ำกว่า 0
            this.hp = 0;
        }

        this.game.log(this.name + "  เสีย HP " + amount);
        this.showStatus(); // แสดง HP ล่าสุด
        // ถ้าผู้เล่น hp เหลือ 0 แสดง ชื่อ ผู้เล่น ว่า ตาย
        if (this.hp === 0){
            console.log(this.name + " ตาย ");
        }
    }

    recoverHp(amount = 1){ // จำนวน HP ที่ต้องการฟื้นฟู
        this.hp += amount; // บวกค่า HP ปัจจุบันเพิ่มขึ้นตามจำนวน amount

        if(this.hp > this.maxHp){ // HP ปัจจุบันสูงเกิน HP สูงสุด ?
            this.hp = this.maxHp; // ถ้าเกิน ให้ดึงกลับมาเท่ากับค่า maxHp
        }

        console.log(this.name + " ฟื้น HP " + amount); // แสดง ว่าผู้เล่นคนนี้ฟื้น HP เท่าไหร่
        this.showStatus(); // แสดง HP ล่าสุด
    }
    // เช็กว่าผู้เล่นคนนี้สามารถใช้การ์ด "ฆ่า" ในเทิร์นนี้ได้หรือไม่ (ถ้ายังไม่เคยใช้จะคืนค่า true)
    canUseSlash(){
        // หากสวมใส่อาวุธที่มีสถานะ infiniteSlash (เช่น จูเก่อเหลียนหนู) จะใช้ฆ่าได้ไม่จำกัดครั้ง
        if (this.infiniteSlash){
            return true;
        }
        // รีเทิร์นค่าตรงข้ามของ slashUsed (ถ้า slashUsed เป็น false จะรีเทิร์น true)
        return !this.slashUsed;
    }
    // ทำเครื่องหมายบันทึกว่าผู้เล่นได้ใช้การ์ด "ฆ่า" ไปแล้วในเทิร์นนี้
    markSlashUsed(){
        // เปลี่ยนสถานะ slashUsed ให้เป็น true เพื่อป้องกันไม่ให้ลงการ์ดฆ่าซ้ำได้อีก
        this.slashUsed = true;
    }
    // เพิ่มสกิล
    addSkill(skill){
        // เพิ่มอินสแตนซ์ของสกิลเข้าไปเก็บไว้ในอาร์เรย์ this.skills ของผู้เล่น
        this.skills.push(skill);
        // สั่งให้สกิลนั้นๆ ลงทะเบียน register รับฟัง Event กับ eventManager ของเกม โดยแนบออบเจกต์ผู้เล่น this ไปด้วย
        skill.register(this.game.eventManager, this);
    }
    // แสดงสกิล
    showSkills(){
        // ตรวจสอบว่าใน array skills ของตัวละครนี้ไม่มีสกิลอยู่เลยใช่หรือไม่
        if (this.skills.length === 0){
            console.log(this.name + " ไม่มีสกิล ");
            return;
        }
        // แสดงรายการสกิลของผู้เล่น
        console.log(this.name + " Skills ");
        // วนลูป skill แต่ละตัวออกมาจาก array skills
        for (const skill of this.skills){
            console.log(" - " + skill.name);
        }
    }
    // คัดกรองและคืนค่าเฉพาะสกิลที่เป็น ActiveSkill ของผู้เล่น
    getActiveSkills(){
        // ใช้ filter คัดเลือกเฉพาะสกิลที่เป็นตัวแปรประเภท ActiveSkill instanceof ActiveSkill
        return this.skills.filter(
            skill => skill instanceof ActiveSkill
        );
    }
    // คัดกรองและคืนค่าเฉพาะสกิลที่เป็น TriggerSkill ของผู้เล่น
    getTriggerSkills(){
        // ใช้ filter คัดเลือกเฉพาะสกิลที่เป็นตัวแปรประเภท TriggerSkill instanceof TriggerSkill
        return this.skills.filter(
            skill => skill instanceof TriggerSkill
        );
    }
    // คัดกรองและคืนค่าเฉพาะสกิลที่เป็น PassiveSkill ของผู้เล่น
    getPassiveSkills(){
        // ใช้ filter คัดเลือกเฉพาะสกิลที่เป็นประเภท PassiveSkill instanceof PassiveSkill
        return this.skills.filter(
            skill => skill instanceof PassiveSkill
        );
    }
    // สวมใส่อาวุธให้ผู้เล่น
    equipWeapon(weapon){
        // ตรวจสอบว่าผู้เล่นมีอาวุธที่สวมใส่อยู่เดิมแล้วหรือไม่
        if (this.weapon){
            // ถอดอาวุธเดิมออกมาก่อน
            const oldWeapon = this.unequipWeapon();
            // เรียกใช้ความสามารถ/ผลลัพธ์ที่จะเกิดขึ้นเมื่อถอดอาวุธเดิม
            oldWeapon.onUnequip(this);
            // นำอาวุธเดิมส่งลงกองทิ้งไพ่ (discardPile) ของเกม
            this.game.discardPile.addCard(oldWeapon);
        }
        // บันทึกอาวุธที่สวมใส่ไว้ในช่อง weapon ของผู้เล่น
        this.weapon = weapon;
        // เรียกใช้ความสามารถ/ผลลัพธ์ที่จะเกิดขึ้นเมื่อสวมใส่อาวุธใหม่
        weapon.onEquip(this);
    }
    // ถอดอาวุธของผู้เล่น
    unequipWeapon(){
        // เก็บอาวุธเดิมไว้ก่อน
        const weapon = this.weapon;
        // ล้างช่องอาวุธให้เป็น null
        this.weapon = null;
        // คืนค่าอาวุธเดิมออกไป เพื่อนำไปจัดการต่อ (เช่น ย้ายลงกองทิ้ง)
        return weapon;
    }
    // ดึงระยะการโจมตีจากอาวุธของผู้เล่น (ถ้าไม่มีอาวุธจะคืนค่าพื้นฐานเป็น 1)
    getWeaponRange(){
        // ถ้าไม่มีอาวุธสวมใส่อยู่ ให้คืนค่าระยะการโจมตีเป็น 1
        if (!this.weapon){
            return 1;
        }
        // ถ้ามีอาวุธ ให้คืนค่าระยะการโจมตีของอาวุธใบนั้น
        return this.weapon.range;
    }
    // สวมใส่เกราะให้ผู้เล่น
    equipArmor(armor){
        // ตรวจสอบว่าผู้เล่นมีเกราะที่สวมใส่อยู่เดิมแล้วหรือไม่
        if (this.armor){
            // ถอดเกราะเดิมออกมาก่อน
            const oldArmor = this.unequipArmor();
            // นำเกราะเดิมส่งลงกองทิ้งไพ่ (discardPile) ของเกม
            this.game.discardPile.addCard(oldArmor);
        }
        // บันทึกเกราะที่สวมใส่ไว้ในช่อง armor ของผู้เล่น
        this.armor = armor;
        // วนลูปอ่านรายการสกิลทั้งหมดของเกราะใบใหม่
        for (const skill of armor.skills){
            // ลงทะเบียน Event ของสกิลเกราะเข้ากับ EventManager ของเกม
            skill.register(this.game.eventManager, this);
        }
    }
    // ถอดเกราะของผู้เล่น
    unequipArmor(){
        // เก็บเกราะเดิมไว้ก่อน
        const armor = this.armor;
        // หากไม่มีเกราะสวมใส่อยู่ ให้คืนค่า null ออกไปทันที
        if (!armor){ 
            return null;
        }
        // วนลูปอ่านรายการสกิลของเกราะเพื่อยกเลิกการลงทะเบียน Event (unregister) ทั้งหมด
        for (const skill of armor.skills){
            // ถอด Listener ของสกิลเกราะออกจาก EventManager
            skill.unregister();
        }
        // ล้างช่องเกราะให้เป็น null
        this.armor = null;
        // คืนค่าเกราะเดิมออกไป เพื่อนำไปจัดการต่อ (เช่น ย้ายลงกองทิ้ง)
        return armor;
    }
    // เพิ่มการ์ดคุมเชิง (Delayed Trick) เข้าไปในพื้นที่หน้าตัวละครของผู้เล่น
    addDelayedTrick(card){
        // นำการ์ด Delayed Trick เพิ่มเข้าไปในอาร์เรย์ delayedTricks
        this.delayedTricks.push(card);
    }
    // ถอดการ์ดคุมเชิง (Delayed Trick) ออกจากหน้าตัวละครของผู้เล่น
    removeDelayedTrick(card){
        // ค้นหาตำแหน่งดรรชนี (index) ของการ์ดที่ต้องการลบในอาร์เรย์ delayedTricks
        const index = this.delayedTricks.indexOf(card);
        // ตรวจสอบว่าพบการ์ดใบนี้อยู่ในอาร์เรย์หรือไม่ (-1 แปลว่าไม่พบ)
        if (index !== -1){
            // ลบการ์ดออกจากอาร์เรย์ ณ ตำแหน่ง index จำนวน 1 ใบ
            this.delayedTricks.splice(index, 1);
        }
    }
    // Debug 
    showDelayedTrick(){
        console.table(this.delayedTricks);
    }
    // เริ่มช่วงเสี่ยงทาย (Judge Phase) ประมวลผลการ์ดหน่วงเวลา
    startJudgePhase(){
        // วนลูปสั่งรันการ์ด Delayed Trick ทุกใบที่ติดอยู่หน้าตัวละคร
        for (const card of this.delayedTricks){
            card.onJudge(this);
        }
    }
    // สั่งให้ผู้เล่นข้าม Play Phase ในเทิร์นนี้
    skipPlay(){
        this.skipPlayPhase = true;
    }
    // รีเซ็ต Flag การข้าม Phase ให้กลับเป็น false
    resetPhaseFlag(){
        this.skipPlayPhase = false;
    }
    // เปิดเผยการ์ดในมือ 1 ใบแบบสุ่ม
    revealHandCard(){
        // หากไม่มีการ์ดในมือ ให้คืนค่า null
        if (this.hand.cards.length === 0){
            return null;
        }
        // สุ่มตำแหน่ง Index ของการ์ดตามจำนวนการ์ดที่มีในมือ
        const index = Math.floor(Math.random() * this.hand.cards.length);
        // Debug
        console.log(this.name + " เปิดไพ่ลำดับ " + index);
        // คืนค่าออบเจกต์การ์ดในมือตามตำแหน่งที่ระบุ
        return this.hand.cards[index];
    }
    // ตรวจสอบว่าผู้เล่นกำลังติดสถานะโซ่ตรวน (Iron Chain) อยู่หรือไม่
    isChained(){
        return this.chained;
    }
    // เช็กว่าผู้เล่นยังมีชีวิตอยู่หรือไม่ (HP มากกว่า 0)
    isAlive(){
        return this.hp > 0;
    }
    // ตรวจสอบว่าผู้เล่นอยู่ในสถานะใกล้ตายหรือไม่ (HP <= 0)
    isDying(){
        return this.hp <= 0;
    }
    // กำหนดสถานะติดโซ่ตรวนของผู้เล่นโดยตรง (true = ติดโซ่, false = หลุดจากโซ่)
    setChained(value){
        this.chained = value;
    }
    // สลับสถานะติดโซ่ตรวนของผู้เล่น (ถ้าติดอยู่จะหลุด / ถ้ายังไม่ติดจะถูกล่ามโซ่)
    toggleChain(){
        // สลับค่าสถานะ boolean (true <-> false)
        this.chained = !this.chained;
        // บันทึก Log แจ้งเตือนสถานะตามค่าปัจจุบัน
        if(this.chained){
            this.game.log(this.name + " ถูกล่ามโซ่");
        }else{
            this.game.log(this.name + " หลุดจากโซ่");
        }
    }
}
