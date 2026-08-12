class HumanController extends Controller{
    // ตัวสร้างวัตถุ กำหนดสถานะ Input เริ่มต้นเป็น idle, ล้างค่า index การ์ด (-1) และเป้าหมายที่เลือก (null)
    constructor(game){
        super(game);
        this.inputState = "idle"; // สถานะการรับ Input ปัจจุบัน
        this.selectedCardIndex = -1; // ดรรชนี (Index) ของการ์ดที่เลือกอยู่บนมือ
        this.selectedTarget = null; // ผู้เล่นเป้าหมายที่เลือก
        this.viewingHandTarget = null; // เก็บออบเจกต์เป้าหมายที่กำลังถูกเปิดดูการ์ดในมือ
        this.selectedSkill = null; // บันทึกออบเจกต์ Skill ที่ผู้เล่นเลือกใช้งาน
        this.selectedSkillCardIndex = -1; // บันทึกตำแหน่ง Index ของการ์ดที่ผู้เล่นเลือกเพื่อมอบผ่านสกิล
        //Steal (ฉกฉวย) State
        this.selectedStealTarget = null;
        this.selectedStealCard = null; 
        this.selectedStealSource = null; 
        this.selectedStealCardIndex = -1;
        // BurnBridge State
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
    }
    // จัดการเทิร์นของผู้เล่นมนุษย์
    playTurn(){ 
        console.log("Human Turn");
        // สั่งให้ UIManager อัปเดตหน้าจอ UI ใหม่ เพื่อรอรับการตอบสนอง (กดการ์ด/กดปุ่ม) จากผู้เล่นมนุษย์
        this.game.ui.render();
        // ยังไม่รู้ผล เพราะกำลังรอผู้เล่นกด
        return null;
    }
    // เรียกใช้การ Recast จาก Game Engine พร้อมล้างค่า State
    recastCard(index){
        // สั่งให้ Game ดำเนินการ Recast การ์ดตาม index ที่เลือก
        const success = this.game.recastCard(index);
        // หาก Recast ไม่สำเร็จ ให้ยกเลิกกระบวนการ
        if(!success){
            return false;
        }
        // ล้างค่าตัวแประบุการ์ดและเป้าหมายที่เคยเลือกไว้
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        // คืนค่าสถานะการรับ Input กลับเป็นปกติ (idle)
        this.inputState = "idle";
        // แจ้ง Game Engine ว่าผู้เล่นมนุษย์ทำ Action สำเร็จแล้ว
        this.game.afterHumanAction(true);
        return true;
    }
    // เมธอดประมวลผลจบเทิร์นของผู้เล่นมนุษย์
    finishTurn(){
        // ดึง index ของการ์ดที่เลือกไว้
        const cardIndex = this.selectedCardIndex;
        // ถ้ากดจบเทิร์น (-1) ให้ส่งเรื่องไปที่ Game Engine เพื่อเข้าสู่ขั้นตอนจบเทิร์น
        if (cardIndex === -1){
            // สั่งให้เกมประมวลผลจบเทิร์น
            this.game.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดโดยเรียกใช้ getSelectedCard()
        const card = this.getSelectedCard();
        // ดัก Error: ถ้าไม่พบวัตถุการ์ด (เช่น ไม่ได้เลือกการ์ด) ให้หยุดทำงานทันที
        if (!card){
            return;
        }
        // แจ้ง Game ให้บันทึก Log
        this.game.log("เลือกการ์ดลำดับ : " + cardIndex);
        // สั่ง Controller เล่นการ์ดใบที่เลือก และรับผลลัพธ์ (true/false)
        const success = this.playCard(cardIndex);
        // ล้างค่าเป้าหมายที่เลือกไว้ เพื่อป้องกันไม่ให้ข้อมูลเป้าหมายเดิมค้างอยู่ในเทิร์นถัดไป
        this.selectedTarget = null;
        // ส่งผลลัพธ์ให้ Game จัดการอัปเดตสถานะและหน้าจอถัดไป
        this.game.afterHumanAction(success);
    }
    // เมธอด API ที่เปิดไว้ให้ส่วน UI (เช่น HTML/DOM Event) เรียกใช้งานเพื่ออัปเดตการ์ดที่เลือก
    selectCard(index){
        // บันทึก index การ์ดที่เลือกลงใน Controller
        this.selectedCardIndex = index;
        // ถ้าผู้เล่นกดจบเทิร์น (index เป็น -1) ให้สั่งจบเทิร์นทันที
        if (index === -1){
            this.finishTurn();
            return;
        }
        // ดึงวัตถุการ์ดผ่าน getSelectedCard()
        const card = this.getSelectedCard();
        // ดัก Error: ถ้าไม่พบวัตถุการ์ด ให้ยกเลิกการทำงาน
        if (!card){
            return;
        }
        // ถ้าการ์ดต้องเลือกเป้าหมาย (เช่น การ์ดโจมตี, ดวล) ให้ Render UI ใหม่ แล้วหยุดรอให้ผู้เล่นคลิกเลือกเป้าหมาย
        if (card.needTarget()){
            this.inputState = "waitingTarget";
            this.game.ui.render();
            return;
        }
        // ถ้าการ์ดไม่ต้องเลือกเป้าหมาย (เช่น การ์ดยา) ให้สั่งจบ/ประมวลผลการเล่นการ์ดทันที
        this.finishTurn();
    }
    // คืนวัตถุการ์ดที่ผู้เล่นกำลังเลือกอยู่ในปัจจุบัน
    getSelectedCard(){
        // ใช้ผู้เล่นที่ Controller ควบคุมอยู่โดยตรง (this.player) แทนการเรียกผ่าน game
        return this.player.hand.cards[this.selectedCardIndex];
    }
    // บันทึกวัตถุผู้เล่นเป้าหมายลงใน Controller
    setSelectedTarget(player){
        // กำหนดค่าผู้เล่นเป้าหมายให้กับตัวแปร selectedTarget
        this.selectedTarget = player;
    }
    // คืนวัตถุผู้เล่นเป้าหมายที่เลือกไว้ปัจจุบัน
    getSelectedTarget(){
        // คืนค่าออบเจกต์ผู้เล่นเป้าหมาย
        return this.selectedTarget;
    }
    // เริ่มต้นสถานะการเปิดดูการ์ดบนมือของผู้เล่นเป้าหมาย
    startViewingHand(target){
        // กำหนดเป้าหมายที่ต้องการเปิดดูการ์ดในมือ
        this.viewingHandTarget = target;
        // เปลี่ยนสถานะการรับ Input เป็น "viewingHand"
        this.inputState = "viewingHand";
        this.game.ui.render();
    }
    // สิ้นสุดสถานะการเปิดดูการ์ดบนมือของผู้เล่นเป้าหมาย
    finishViewingHand(){
        // ล้างออบเจกต์เป้าหมายที่เปิดดู
        this.viewingHandTarget = null;
        // คืนค่าสถานะการรับ Input กลับเป็นปกติ (idle)
        this.inputState = "idle";
        this.game.ui.render();
    }
    // คืนค่าผู้เล่นเป้าหมายที่ผู้เล่นมนุษย์เลือกไว้บน UI
    getTarget(card){
        // เรียกใช้ getSelectedTarget() เพื่อดึงเป้าหมายปัจจุบันที่ผู้เล่นเลือกไว้
        return this.getSelectedTarget();
    }
    // รีเซ็ตค่าการขโมยเดิม และเปลี่ยนสถานะเป็น "waitingStealCard"
    startStealSelection(){
        // ล้างค่าการ์ดและแหล่งที่มาจากการ Steal ครั้งก่อน
        this.selectedStealCard = null;
        this.selectedStealSource = null;
        this.selectedStealCardIndex = -1;
        // เปลี่ยนสถานะเป็นรอเลือกการ์ดที่จะขโมย
        this.inputState = "waitingStealCard";
        this.game.ui.render();
    }
    // เริ่มต้นสถานะให้ผู้เล่นเลือกโซนเป้าหมายที่จะขโมย
    startStealSourceSelection(){
        // เปลี่ยนสถานะการรับ Input เป็นรอเลือกโซนขโมย
        this.inputState = "waitingStealSource";
        this.game.ui.render();
    }
    // เริ่มต้นสถานะให้ผู้เล่นเลือกโซนเป้าหมายที่จะทำลายการ์ด (สะพานขาด)
    startBurnSourceSelection(){
        // เปลี่ยนสถานะการรับ Input เป็นรอเลือกโซนที่จะทำลาย
        this.inputState = "waitingBurnSource";
        this.game.ui.render();
    }
    // รับตำแหน่ง Index ของการ์ดเป้าหมายที่ต้องการขโมย
    selectStealCard(index){
        // ดึงเป้าหมายที่เลือกไว้
        const target = this.selectedStealTarget;
        // ถ้ายังไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // ตรวจสอบว่า Index อยู่ในขอบเขตการ์ดบนมือของเป้าหมายหรือไม่
        if(index < 0 || index >= target.hand.cards.length){
            return;
        }
        // บันทึกข้อมูลการเลือก
        this.selectedStealSource = "hand";
        this.selectedStealCard = target.hand.cards[index];
        this.selectedStealCardIndex = index;
    }
    // จัดการการเลือกโซนที่จะขโมยการ์ด (มือ หรือ อาวุธ) จากผู้เล่นเป้าหมาย
    selectStealSource(source){
        const target = this.selectedStealTarget;
        // หากไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return false;
        }
        // กรณีเลือกขโมยจาก "มือ"
        if(source === "hand"){
            this.selectedStealSource = "hand";
            this.startStealSelection();
            return true;
        }
        // กรณีเลือกขโมย "อาวุธ"
        if(source === "weapon"){
            // หากเป้าหมายไม่มีอาวุธ ให้ยกเลิก
            if(!target.weapon){
                return false;
            }
            this.selectedStealSource = "weapon";
            this.selectedStealCard = target.weapon;
            this.selectedStealCardIndex = -1;
            return true;
        }
        // กรณีเลือกขโมย "เกราะ"
        if(source === "armor"){
            //หากเป้าหมายไม่มีเกราะ ให้ยกเลิก
            if(!target.armor){
                return false;
            }
            this.selectedStealSource = "armor";
            this.selectedStealCard = target.armor;
            this.selectedStealCardIndex = -1;
            return true;
        }
        return false;
    }
    // จัดการการเลือกโซนที่จะทำลายการ์ด (มือ, อาวุธ หรือ เกราะ) จากผู้เล่นเป้าหมาย
    selectBurnSource(source){
        const target = this.selectedBurnTarget;
        // หากไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return false;
        }
        // กรณีเลือกทำลายการ์ดจาก "มือ"
        if(source === "hand"){
            // หากเป้าหมายไม่มีไพ่บนมือ ให้ยกเลิก
            if(target.hand.cards.length === 0){
                return false;
            }
            this.selectedBurnSource = "hand";
            return true;
        }
        // กรณีเลือกทำลาย "อาวุธ"
        if(source === "weapon"){
            // หากเป้าหมายไม่ได้สวมใส่อาวุธ ให้ยกเลิก
            if(!target.weapon){
                return false;
            }
            this.selectedBurnSource = "weapon";
            return true;
        }
        // กรณีเลือกทำลาย "เกราะ"
        if(source === "armor"){
            // หากเป้าหมายไม่ได้สวมใส่เกราะ ให้ยกเลิก
            if(!target.armor){
                return false;
            }
            this.selectedBurnSource = "armor";
            return true;
        }
        return false;
    }
    // ทำการย้ายการ์ดที่เลือกไว้จากมือของเป้าหมาย เข้าสู่มือของผู้เล่น
    stealSelectedCard(){
        const target = this.selectedStealTarget;
        // ตรวจสอบว่ามีเป้าหมายหรือไม่
        if(!target){
            return false;
        }
        // ตรวจสอบว่าเป็นแหล่งข้อมูลจากมือ ("hand") หรือไม่
        if(this.selectedStealSource !== "hand"){
            return false;
        }
        const index = this.selectedStealCardIndex;
        // ตรวจสอบว่า Index อยู่ในขอบเขตการ์ดมือเป้าหมายหรือไม่
        if(index < 0 || index >= target.hand.cards.length){
            return false;
        }
        // ดึงการ์ดออกจากมือเป้าหมาย
        const card = target.hand.removeCard(index);
        if(!card){
            return false;
        }
        // เพิ่มการ์ดเข้ามือผู้ใช้
        this.player.hand.addCard(card);
        return true;
    }
    // ดำเนินการย้ายอุปกรณ์ (อาวุธ หรือ เกราะ) จากผู้เล่นเป้าหมายมาให้ผู้เล่นปัจจุบันสวมใส่
    stealSelectedEquipment(){
        const target = this.selectedStealTarget;
        // หากไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return false;
        }
        // กรณีขโมย "อาวุธ" (weapon)
        if(this.selectedStealSource === "weapon"){
            if(!target.weapon){
                return false;
            }
            // ดึงออบเจกต์อาวุธของเป้าหมาย
            const weapon = target.weapon;
            // ถอดอาวุธออกจากเป้าหมาย และนำมาสวมใส่ให้ผู้เล่นปัจจุบัน
            target.unequipWeapon();
            this.player.equipWeapon(weapon);
            return true;
        }
        // กรณีขโมย "เกราะ" (armor)
        if(this.selectedStealSource === "armor"){
            if(!target.armor){
                return false;
            }
            // ดึงออบเจกต์เกราะของเป้าหมาย
            const armor = target.armor;
            // ถอดเกราะออกจากเป้าหมาย และนำมาสวมใส่ให้ผู้เล่นปัจจุบัน
            target.unequipArmor();
            this.player.equipArmor(armor);
            return true;
        }
        return false;
    }
    // ยืนยันการขโมยการ์ด/อุปกรณ์ที่เลือก ดำเนินการขโมย ล้าง State
    confirmStealSelection(){
        let success = false;
        // ขโมยไพ่จากมือ
        if(this.selectedStealSource === "hand"){
            success = this.stealSelectedCard();
        }
        // ขโมยอาวุธที่สวมใส่อยู่
        if(this.selectedStealSource === "weapon"){
            success = this.stealSelectedEquipment();
        }
        //ขโมยเกราะที่สวมใส่อยู่
        if(this.selectedStealSource === "armor"){
            success = this.stealSelectedEquipment();
        }
        // ถ้าย้ายการ์ดไม่สำเร็จ ให้ยกเลิก
        if(!success){
            return false;
        }
        // คืนค่าสถานะหลักเป็นปกติ
        this.inputState = "idle";
        // ล้างค่า State ของการขโมยทั้งหมด
        this.selectedStealTarget = null;
        this.selectedStealCard = null;
        this.selectedStealSource = null;
        this.selectedStealCardIndex = -1;
        // สั่ง UI ให้แสดงผลใหม่ (กลับมาแสดงมือผู้เล่น)
        this.game.ui.render();
        return true;
    }
    // คืนค่า true แสดงว่ากำลังรอ Input จากผู้เล่นมนุษย์
    isWaitingInput(){
        return true;
    }
    // รับ Event เลือกเป้าหมาย ตรวจสอบเงื่อนไข รีเซ็ต State กลับเป็น idle และสั่งประมวลผล
    selectTarget(player){
        console.log("selectTarget ถูกเรียก", player.name); // Debug
        // ดึงการ์ดที่ผู้เล่นเลือกไว้บนมือ
        const card = this.getSelectedCard();
        // หากไม่มีการ์ดที่เลือกอยู่ ให้ยกเลิกการทำงานทันที
        if (!card){
            return;
        }
        // ตรวจสอบเงื่อนไขว่าการ์ดใบนี้สามารถเลือกผู้เล่นเป้าหมายคนนี้ได้หรือไม่ (ใช้ this.player)
        if (!card.canTarget(this.player, player)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        // บันทึกวัตถุผู้เล่นเป้าหมายลงใน Controller
        this.setSelectedTarget(player);
        // รีเซ็ตสถานะการรับ Input กลับเป็นสถานะว่าง (idle)
        this.inputState = "idle";
        // เรียกใช้เมธอด finishTurn() เพื่อเริ่มประมวลผลการใช้การ์ดกับเป้าหมาย
        this.finishTurn();
    }
    // สอบถามการ์ด "โจมตี" สำหรับ HumanController
    askSlash(player, game){
        // ค้นหารายการการ์ด "โจมตี" ทั้งหมดในมือของผู้เล่น
        const slashCards = player.hand.findSlashCards();
        // หากไม่มีการ์ด "โจมตี" ในมือเลย ให้คืนค่า -1 (ไม่มีการ์ดให้เลือก)
        if(slashCards.length === 0){
            return -1;
        }
        // คืนค่า index ของการ์ดใบแรก
        return slashCards[0].index;
    }
    //
    isHuman(){
        return true;
    }
    // สอบถามและค้นหาตำแหน่งการ์ด "หลบ" ในมือของผู้เล่น
    askDodge(player){
        // คืนค่าตำแหน่งดรรชนี (Index) ของการ์ด "หลบ" ที่พบในมือ (หากไม่พบจะคืนค่า -1)
        return player.hand.findCardIndexByName("หลบ");
    }
    // สอบถามการใช้งานการ์ด "ยา" จากผู้เล่นที่เป็นมนุษย์ (Human)
    askPeach(player){
        // ค้นหาดัชนีของการ์ด "ยา" ในมือของผู้เล่น
        const index = player.hand.findCardIndexByName("ยา");
        // ถ้าไม่มีการ์ด "ยา" ในมือ ให้คืนค่า -1 (ไม่สามารถใช้ยาได้)
        if(index === -1){
            return -1;
        }
        // เปลี่ยนสถานะ Input State เป็น "waitingPeach" เพื่อเตรียมรองรับการกดปุ่มยืนยันจาก UI
        this.inputState = "waitingPeach";
        // คืนค่าตำแหน่ง index ของการ์ดยาที่พบ
        return index;
    }
    // ผู้เล่นกดปุ่ม "ใช้ยา" ช่วยชีวิต
    confirmPeach(){
        // รีเซ็ตสถานะ Input กลับเป็น idle
        this.inputState = "idle";
        this.game.resumeDying(true);
    }
    // ผู้เล่นกดปุ่ม "ไม่ใช้ยา" (ข้าม)
    declinePeach(){
        // รีเซ็ตสถานะ Input กลับเป็น idle
        this.inputState = "idle";
        this.game.resumeDying(false);
    }
    // เช็กว่าผู้เล่น Human กำลังอยู่ในสถานะรอตัดสินใจกดใช้ยาหรือไม่
    isWaitingPeach(){
        return this.inputState === "waitingPeach";
    }
    // เริ่มต้นสถานะการเลือกเป้าหมาย (Target) ให้กับ สกิล (Skill) สำหรับ Human
    startSkillTargetSelection(skill){
        // บันทึกสกิลที่กำลังจะใช้งานลงในตัวแปร selectedSkill
        this.selectedSkill = skill;
        // ล้างค่าเป้าหมายเดิมออกก่อน
        this.selectedTarget = null;
        // ปลี่ยนสถานะ Input ให้เป็น "waitingSkillTarget" เพื่อรอผู้เล่นคลิกเลือกตัวละครเป้าหมาย
        this.inputState = "waitingSkillTarget";
        this.game.ui.render();
    }
    // เริ่มต้นกระบวนการใช้ Active Skill โดยถามเงื่อนไขจาก Skill ก่อนว่าต้องการเลือก Target หรือเลือก การ์ด ในมือหรือไม่
    startSkillUse(skill){
        // บันทึก สกิล ที่กำลังเลือกไว้
        this.selectedSkill = skill;
        // รีเซ็ตค่าเป้าหมายและการ์ดที่เคยเลือกไว้เดิม
        this.selectedTarget = null;
        this.selectedSkillCardIndex = -1;
        // ตรวจสอบว่า สกิล ต้องการให้เลือกเป้าหมายก่อนหรือไม่
        if(skill.needsTarget(this.player, this.game)){
            this.inputState = "waitingSkillTarget";
            this.game.ui.render();
            return;
        }
        // ตรวจสอบว่า สกิล ต้องการให้เลือกการ์ดจากมือก่อนหรือไม่
        if(skill.needsCardSelection(this.player, this.game)){
            this.inputState = "waitingSkillCard";
            this.game.ui.render();
            return;
        }
        // หากไม่ต้องเลือกอะไรเพิ่ม ให้รันเมธอด use() ของ สกิล ทันที
        const success = skill.use(this.player, this.game);
        // ส่งผลลัพธ์การทำงานหลังผู้เล่นทำ Action
        this.game.afterHumanAction(success);
    }
    // รับตัวละครเป้าหมาย (player) จากการคลิกเลือกของ Human แล้วส่งให้ Skill ประมวลผล
    selectSkillTarget(player){
        console.log("selectSkillTarget ถูกเรียก", player.name);
        // ตรวจสอบสถานะว่าต้องอยู่ในช่วงรอเลือกเป้าหมายให้สกิลเท่านั้น
        if(this.inputState !== "waitingSkillTarget"){
            return;
        }
        // ดึงออบเจกต์ สกิล ที่เก็บบันทึกไว้
        const skill = this.selectedSkill;
        if(!skill){
            return;
        }
        // ตรวจสอบว่าเป้าหมายถูกต้องตามกฎของ สกิล หรือไม่
        if(!skill.canTarget(this.player, player)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        // บันทึกตัวละครเป้าหมายที่เลือกไว้ใน selectedTarget
        this.setSelectedTarget(player);
        // เช็กด้วย Framework ใหม่: ถ้าสกิลต้องการให้เลือกการ์ดต่อ ให้เปลี่ยนสถานะรอเลือกการ์ด
        if(skill.needsCardSelection(this.player, this.game)){
            this.inputState = "waitingSkillCard";
            this.game.ui.render();
            return;
        }
        // ถ้าสกิลไม่ต้องการเลือกการ์ดต่อ ให้รันสกิลทันที
        this.inputState = "idle";
        const success = skill.use(this.player, this.game);
        this.game.afterHumanAction(success);
    }
    // รับตำแหน่ง Index ของการ์ดที่ผู้เล่นเลือก แล้วส่งให้สกิลประมวลผลการส่งมอบ
    selectSkillCard(index){
        console.log("selectSkillCard ถูกเรียก", index);
        // ตรวจสอบสถานะว่าต้องอยู่ในช่วงรอเลือกการ์ดให้สกิลเท่านั้น
        if(this.inputState !== "waitingSkillCard"){
            return;
        }
        // ดึงออบเจกต์ สกิล ที่เก็บบันทึกไว้ใน selectedSkill
        const skill = this.selectedSkill;
        if(!skill){
            return;
        }
        // ตรวจสอบว่ามี การ์ด อยู่ในตำแหน่ง Index ดังกล่าวจริงหรือไม่
        const card = this.player.hand.cards[index];
        if(!card){
            return;
        }
        // บันทึกตำแหน่งการ์ดที่เลือกไว้ใน selectedSkillCardIndex
        this.selectedSkillCardIndex = index;
        // เเรียกใช้ Skill ก่อน
        const success = skill.use(this.player, this.game);
        // หลัง Skill ทำงานเสร็จแล้วค่อยล้าง State
        this.selectedSkill = null;
        this.selectedSkillCardIndex = -1;
        this.inputState = "idle";
        // ใช้สกิลสำเร็จแล้ว ล้างเป้าหมายของสกิล
        if(success){
            this.selectedTarget = null;
        }
        // แจ้งเกมหลักประมวลผลต่อหลังจาก Human ทำแอคชันเสร็จสิ้น
        this.game.afterHumanAction(success);
    }
}
