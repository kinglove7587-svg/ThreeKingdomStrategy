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
        this.weapon = null;
        this.infiniteSlash = false;
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
        this.hp -= amount;

        if (this.hp < 0){
            this.hp = 0;
        }
    }

    heal(amount){ // ฟื้นฟู HP
        this.hp += amount;

        if (this.hp > this.maxHp){
            this.hp = this.maxHp;
        }
    }

    showStatus(){ // แสดงสถานะผู้เล่น
        console.log(this.name + "HP : " + this.hp + "/" + this.maxHp);
    }

    loseHp(amount = 1){ // รับค่าจำนวน HP ที่ต้องลด
        this.hp -= amount;

        if (this.hp < 0){ // ทำการลด HP ของผู้เล่น และคุมไม่ให้ HP ต่ำกว่า 0
            this.hp = 0;
        }

        console.log(this.name + "  เสีย HP " + amount); // แสดง ข้อความ HP ที่เสียไป
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

}
