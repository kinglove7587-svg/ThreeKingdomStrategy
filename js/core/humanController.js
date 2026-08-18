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
        this.selectedSkillCardIndices = [];
        //Steal (ฉกฉวย) State
        this.selectedStealTarget = null;
        this.selectedStealCard = null; 
        this.selectedStealSource = null; 
        this.selectedStealCardIndex = -1;
        // BurnBridge State
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
        this.selectedBurnCard = null;
        this.selectedBurnCardIndex = -1;
        // เก็บ Trigger Skill ที่กำลังรอการตัดสินใจ
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        // Frost Sword State
        this.selectedFrostSwordCards = [];
        // Sky Piercing Halberd State
        this.selectedAdditionalTargets = [];
        this.additionalTargetLimit = 0;
        this.additionalTargetContext = null;
        // State สำหรับ Borrowed Sword
        this.borrowedSwordContext = null;
        this.selectedBorrowedSwordTarget = null;
        // State สำหรับประมวลผล Slash แบบหลายเป้าหมายทีละลำดับ
        this.pendingSlashContext = null;
        this.pendingSlashTargets = [];
        this.pendingSlashTargetIndex = 0;
        this.pendingSlashTriggerAfterDamage = false;
        // State สำหรับเก็บ Context ของ Reaction
        this.reactionContext = null;
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
        // จำไว้ว่า Action นี้เปิด Reaction หรือไม่ ก่อนที่ Reaction จะทำงาน
        const reactionWasOpened = !!(
            this.game.reactionManager && 
            this.game.reactionManager.active
        );
        // ล้าง Reaction Context เก่าก่อนเริ่ม Action ใหม่
        this.reactionContext = null;
        // สั่ง Controller เล่นการ์ดใบที่เลือก และรับผลลัพธ์ (true/false)
        const success = this.playCard(cardIndex);
        // ล้างค่าเป้าหมายที่เลือกไว้ เพื่อป้องกันไม่ให้ข้อมูลเป้าหมายเดิมค้างอยู่ในเทิร์นถัดไป
        this.selectedTarget = null;
        // รอ Trigger ที่ต่อจากการ์ดให้จบก่อน
        if(
            this.inputState === "waitingTriggerChoice" || 
            this.inputState === "waitingTriggerCard" || 
            this.inputState === "waitingTriggerTarget" || 
            this.inputState === "waitingAdditionalTargets" || 
            this.inputState === "waitingBorrowedSwordTarget" || 
            this.inputState === "waitingFrostSwordCard"
        ){
            return;
        }
        // การ์กจบการทำงานสมบูรณ์แล้ว
        this.selectedCardIndex = -1;
        // ReactionManager จะเป็นคนเรียก afterHumanAction()
        if(this.reactionContext){
            return;
        }
        // ส่งผลลัพธ์ให้ Game จัดการอัปเดตสถานะและหน้าจอถัดไป
        this.game.afterHumanAction(success);
    }
    // เมธอด API ที่เปิดไว้ให้ส่วน UI (เช่น HTML/DOM Event) เรียกใช้งานเพื่ออัปเดตการ์ดที่เลือก
    selectCard(index){
        // หากกำลังรอเลือกเป้าหมายอยู่ แล้วผู้เล่นกดเลือกการ์ดใบเดิมซ้ำ -> ให้ยกเลิกการเลือกการ์ด
        if(
            this.inputState === "waitingTarget" && 
            this.selectedCardIndex === index
        ){
            
            const card = this.getSelectedCard();
            console.log("ยกเลิกการเลือกการ์ด", card ? card.name : "(ไม่พบการ์ด)");

            this.selectedCardIndex = -1;
            this.selectedTarget = null;
            this.inputState = "idle";
            this.game.ui.render();
            return;
            
        }
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
    // เริ่มต้นสถานะให้ผู้เล่นเลือกโซนเป้าหมายที่จะทำลายการ์ด (ถอนสะพาน)
    startBurnSourceSelection(){
        // เปลี่ยนสถานะการรับ Input เป็นรอเลือกโซนที่จะทำลาย
        this.inputState = "waitingBurnSource";
        this.game.ui.render();
    }
    // เปลี่ยนสถานะรับ Input เป็นรอเลือกการ์ดที่จะทำลาย
    startBurnCardSelection(){
        this.inputState = "waitingBurnCard";
        this.game.ui.render();
    }
    // เปลี่ยนสถานะเป็น waitingSelection เพื่อเตรียมแสดง UI หน้าเลือกการ์ดกลางโต๊ะ
    startSelection(){
        this.inputState = "waitingSelection";
        this.game.ui.render();
    }
    // คืนสถานะกลับเป็น idle และอัปเดต UI เมื่อการเลือกการ์ดเสร็จสิ้น
    finishSelection(){
        this.inputState = "idle";
        this.game.ui.render();
    }
    // เลือกการ์ดที่จะขโมยจากเป้าหมายตาม Zone ที่ระบุ
    selectStealCard(index){
        // ดึงเป้าหมายที่เลือกไว้
        const target = this.selectedStealTarget;
        // ถ้ายังไม่มีเป้าหมาย ให้ยกเลิกการทำงาน
        if(!target){
            return;
        }
        // กรณีเลือกขโมยจาก "มือ"
        if(this.selectedStealSource === "hand"){

            if(index < 0 || index >= target.hand.cards.length){
                return false;
            }

            this.selectedStealCard = target.hand.cards[index];
            this.selectedStealCardIndex = index;
            return true;
        }
        // กรณีเลือกขโมย "อาวุธ"
        if(this.selectedStealSource === "weapon"){

            if(!target.weapon){
                return false;
            }

            this.selectedStealCard = target.weapon;
            this.selectedStealCardIndex = -1;
            return true;
        }
        // กรณีเลือกขโมย "เกราะ"
        if(this.selectedStealSource === "armor"){

            if(!target.armor){
                return false;
            }

            this.selectedStealCard = target.armor;
            this.selectedStealCardIndex = -1;
            return true;
        }
        // กรณีเลือกขโมย "ม้า"
        if(this.selectedStealSource === "mount"){

            if(!target.mount){
                return false;
            }

            this.selectedStealCard = target.mount;
            this.selectedStealCardIndex = -1;
            return true;
        }
        // กรณีเลือกขโมยจาก "Judgement Zone"
        if(this.selectedStealSource === "judgement"){

            if(index < 0 || index >= target.delayedTricks.length){
                return false;
            }

            this.selectedStealCard = target.delayedTricks[index];
            this.selectedStealCardIndex = index;
            return true;
        }
        return false;
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
            this.startStealSelection();
            return true;
        }
        // กรณีเลือกขโมย "เกราะ"
        if(source === "armor"){
            //หากเป้าหมายไม่มีเกราะ ให้ยกเลิก
            if(!target.armor){
                return false;
            }
            this.selectedStealSource = "armor";
            this.startStealSelection();
            return true;
        }
        // กรณีเลือกขโมย "ม้า" (mount)
        if(source === "mount"){

            if(!target.mount){
                return false;
            }
            this.selectedStealSource = "mount";
            this.startStealSelection();
            return true;
        }
        // กรณีเลือกขโมยจาก "Judgement Zone" (delayedTricks)
        if(source === "judgement"){

            if(target.delayedTricks.length === 0){
                return false;
            }
            this.selectedStealSource = "judgement";
            this.startStealSelection();
            return true;
        }
        return false;
    }
    // เลือกตำแหน่ง (Zone) ที่จะทำลายการ์ดของเป้าหมาย (รองรับ 5 Zone)
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
            this.startBurnCardSelection();
            return true;
        }
        // กรณีเลือกทำลาย "อาวุธ"
        if(source === "weapon"){
            // หากเป้าหมายไม่ได้สวมใส่อาวุธ ให้ยกเลิก
            if(!target.weapon){
                return false;
            }
            this.selectedBurnSource = "weapon";
            this.startBurnCardSelection();
            return true;
        }
        // กรณีเลือกทำลาย "เกราะ"
        if(source === "armor"){
            // หากเป้าหมายไม่ได้สวมใส่เกราะ ให้ยกเลิก
            if(!target.armor){
                return false;
            }
            this.selectedBurnSource = "armor";
            this.startBurnCardSelection();
            return true;
        }
        // กรณีเลือกทำลาย "ม้า"
        if(source === "mount"){

            if(!target.mount){
                return false;
            }

            this.selectedBurnSource = "mount";
            this.startBurnCardSelection();
            return true;
        }
        // กรณีเลือกทำลาย "Judgement Zone"
        if(source === "judgement"){
            
            if(target.delayedTricks.length === 0){
                return false;
            }

            this.selectedBurnSource = "judgement";
            this.startBurnCardSelection();
            return true;
        }
        return false;
    }
    // บันทึกการ์ดเป้าหมายที่จะทำลาย (มือ, อาวุธ หรือ เกราะ) ลงใน State
    selectBurnCard(index){
        const target = this.selectedBurnTarget;
        // หากไม่มีเป้าหมาย ให้ยกเลิก
        if(!target){
            return false;
        }
        // กรณีเลือกทำลายจาก "มือ"
        if(this.selectedBurnSource === "hand"){
            // ตรวจสอบว่า Index อยู่ในขอบเขตการ์ดที่มีอยู่จริงหรือไม่
            if(index < 0 || index >= target.hand.cards.length){
                return false;
            }
            // บันทึกการ์ดและตำแหน่ง Index ที่เลือกไว้ใน State
            this.selectedBurnCard = target.hand.cards[index];
            this.selectedBurnCardIndex = index;
            return true;
        }
        // กรณีเลือกทำลาย "อาวุธ" (weapon)
        if(this.selectedBurnSource === "weapon"){
            if(!target.weapon){
                return false;
            }
            this.selectedBurnCard = target.weapon;
            this.selectedBurnCardIndex = -1;
            return true;
        }
        // กรณีเลือกทำลาย "เกราะ" (armor)
        if(this.selectedBurnSource === "armor"){
            if(!target.armor){
                return false;
            }
            this.selectedBurnCard = target.armor;
            this.selectedBurnCardIndex = -1;
            return true;
        }
        // กรณีเลือกทำลาย "ม้า" (mount)
        if(this.selectedBurnSource === "mount"){

            if(!target.mount){
                return false;
            }

            this.selectedBurnCard = target.mount;
            this.selectedBurnCardIndex = -1;
            return true;
        }
        // กรณีเลือกทำลายจาก Judgement Zone
        if(this.selectedBurnSource === "judgement"){

            if(index < 0 || index >= target.delayedTricks.length){
                return false;
            }

            this.selectedBurnCard = target.delayedTricks[index];
            this.selectedBurnCardIndex = index;
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
    // ขโมยอุปกรณ์ (อาวุธ/เกราะ/ม้า) จากเป้าหมายเข้ามือของผู้เล่น
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
            
            const weapon = target.unequipWeapon();
            if(!weapon){
                return false;
            }

            this.player.hand.addCard(weapon);
            return true;
        }
        // กรณีขโมย "เกราะ" (armor)
        if(this.selectedStealSource === "armor"){
            if(!target.armor){
                return false;
            }
            
            const armor = target.unequipArmor();
            if(!armor){
                return false;
            }

            this.player.hand.addCard(armor);
            return true;
        }
        // กรณีขโมย "ม้า"
        if(this.selectedStealSource === "mount"){

            if(!target.mount){
                return false;
            }

            const mount = target.unequipMount();
            if(!mount){
                return false;
            }

            this.player.hand.addCard(mount);
            return true;
        }
        return false;
    }
    // ขโมยการ์ดจาก Judgement Zone
    stealSelectedJudgement(){
        // ดึงเป้าหมายที่เลือกไว้
        const target = this.selectedStealTarget;
        if(!target){
            return false;
        }
        // ตรวจสอบว่าแหล่งที่เลือกเป็น Judgement Zone
        const index = this.selectedStealCardIndex;
        if(index < 0 || index >= target.delayedTricks.length){
            return false;
        }
        // ดึงการ์ดออก
        const card = target.delayedTricks.splice(index, 1)[0];
        if(!card){
            return false;
        }

        this.player.hand.addCard(card);
        return true;
    }
    // ยืนยันการขโมยการ์ด นำการ์ดเข้ามือ ล้าง State การขโมยทั้งหมด
    confirmStealSelection(){
        let success = false;
        // ขโมยไพ่จากมือ
        if(this.selectedStealSource === "hand"){
            success = this.stealSelectedCard();
        }
        // ขโมยอุปกรณ์ (อาวุธ/เกราะ/ม้า)
        if(
            this.selectedStealSource === "weapon" || 
            this.selectedStealSource === "armor" || 
            this.selectedStealSource === "mount"
        ){
            success = this.stealSelectedEquipment();
        }
        // ขโมยจาก Judgement Zone
        if(this.selectedStealSource === "judgement"){
            success = this.stealSelectedJudgement();
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
    // ยืนยันการทำลายการ์ด นำการ์ดลงกองทิ้ง ล้างค่า State ทั้งหมด
    confirmBurnSelection(){
        // เรียกใช้ discardSelectedBurnCard เพื่อทิ้งการ์ดลง discardPile
        const success = this.discardSelectedBurnCard();
        // หากทำรายการไม่สำเร็จ ให้ยกเลิก
        if(!success){
            return false;
        }
        // คืนค่าสถานะหลักกลับเป็น idle
        this.inputState = "idle";
        // ล้างค่าข้อมูลการเลือก Burn ทั้งหมด
        this.selectedBurnTarget = null;
        this.selectedBurnSource = null;
        this.selectedBurnCard = null;
        this.selectedBurnCardIndex = -1;
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
        this.selectedSkillCardIndices = [];
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
            this.selectedSkillCardIndices = [];
            this.inputState = "waitingSkillCard";
            this.game.ui.render();
            return;
        }
        // ถ้าสกิลไม่ต้องการเลือกการ์ดต่อ ให้รันสกิลทันที
        this.inputState = "idle";
        const success = skill.use(this.player, this.game);
        this.game.afterHumanAction(success);
    }
    // จัดการเลือกการ์ดบนมือเพื่อใช้ Active Skill
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
        //
        if(this.selectedSkillCardIndices.includes(index)){
            return;
        }
        // บันทึก Index เข้า Array และอัปเดต selectedSkillCardIndex ให้สกิลเดิม (เช่น Rende) ใช้องค์ประกอบเดิมได้
        this.selectedSkillCardIndices.push(index);
        this.selectedSkillCardIndex = index;

        console.log("Skill Card Selection =", this.selectedSkillCardIndices);
        // ดึงจำนวนการ์ดที่ สกิล นั้นต้องการ
        const requiredCount = skill.cardSelectionCount(this.player, this.game);
        // หากยังเลือกการ์ดไม่ครบตามจำนวนที่สกิลต้องการ ให้สั่งวาด UI ใหม่แล้วรอเลือกใบถัดไป
        if(this.selectedSkillCardIndices.length < requiredCount){
            this.game.ui.render();
            return;
        }
        // เมื่อเลือกครบตามจำนวนแล้ว ให้สั่งเรียกใช้งาน สกิล
        const success = skill.use(this.player, this.game);
        // หลัง Skill ทำงานเสร็จแล้วค่อยล้าง State
        this.selectedSkill = null;
        this.selectedSkillCardIndex = -1;
        this.selectedSkillCardIndices = [];
        this.inputState = "idle";
        // ใช้สกิลสำเร็จแล้ว ล้างเป้าหมายของสกิล
        if(success){
            this.selectedTarget = null;
        }
        // แจ้งเกมหลักประมวลผลต่อหลังจาก Human ทำแอคชันเสร็จสิ้น
        this.game.afterHumanAction(success);
    }
    // ทิ้งการ์ดที่เลือกของเป้าหมาย (มือ / อาวุธ / เกราะ) ลงในกองทิ้ง (discardPile)
    discardSelectedBurnCard(){
        const target = this.selectedBurnTarget;
        // หากไม่มีเป้าหมาย ให้ยกเลิก
        if(!target){
            return false;
        }
        // กรณีเลือกทำลายจาก "มือ"
        if(this.selectedBurnSource === "hand"){
            const index = this.selectedBurnCardIndex;
            // ตรวจสอบว่า Index อยู่ในขอบเขตการ์ดที่มีอยู่จริงหรือไม่
            if(index < 0 || index >= target.hand.cards.length){
                return false;
            }
            // ถอดการ์ดออกจากมือของเป้าหมาย
            const card = target.hand.removeCard(index);

            if(!card){
                return false;
            }
            // นำการ์ดใบนั้นเข้ากองทิ้งของเกม
            this.game.discardPile.addCard(card);
            return true;
        }
        // กรณีเลือกทำลาย "อาวุธ" (weapon)
        if(this.selectedBurnSource === "weapon"){
            if(!target.weapon){
                return false;
            }
            // ถอดอาวุธออกจากเป้าหมาย
            const weapon = target.unequipWeapon();
            
            if(!weapon){
                return false;
            }
            // นำอาวุธเข้ากองทิ้งของเกม
            this.game.discardPile.addCard(weapon);
            return true;
        }
        // กรณีเลือกทำลาย "เกราะ" (armor)
        if(this.selectedBurnSource === "armor"){
            if(!target.armor){
                return false;
            }
            // ถอดเกราะออกจากเป้าหมาย (และยกเลิก Event Listeners ของเกราะ)
            const armor = target.unequipArmor();
            
            if(!armor){
                return false;
            }
            // นำเกราะเข้ากองทิ้งของเกม
            this.game.discardPile.addCard(armor);
            return true;
        }
        // กรณีเลือกทำลาย "ม้า"
        if(this.selectedBurnSource === "mount"){

            if(!target.mount){
                return false;
            }

            const mount = target.unequipMount();
            if(!mount){
                return false;
            }

            this.game.discardPile.addCard(mount);
            return true;
        }
        // กรณีเลือกทำลาย "Judgement Zone"
        if(this.selectedBurnSource === "judgement"){

            const index = this.selectedBurnCardIndex;
            if(index < 0 || index >= target.delayedTricks.length){
                return false;
            }

            const card = target.delayedTricks.splice(index, 1)[0];
            if(!card){
                return false;
            }

            this.game.discardPile.addCard(card);
            return true;
        }
        return false;
    }
    // เริ่มสถานะรอการตัดสินใจของผู้เล่นสำหรับ Trigger Skill
    startTriggerChoice(skill, context){
        this.selectedTriggerSkill = skill;
        this.triggerContext = context;
        this.inputState = "waitingTriggerChoice";

        this.game.ui.render();
    }
    // เริ่มต้นสถานะรอตอบ Reaction สำหรับ Human Controller
    startReaction(context){

        this.reactionContext = context;
        this.inputState = "waitingReaction";
        this.game.ui.render();
    }
    // รับคำตอบการตัดสินใจตอบโต้ (Reaction) 
    resolveReaction(useReaction){

        if(this.inputState !== "waitingReaction"){
            return false;
        }

        const context = this.reactionContext;
        if(!context){
            return false;
        }
        console.log(this.player.name, useReaction 
            ? "ใช้ Reaction" : "ไม่ใช้ Reaction"
        );
        // รีเซ็ต State ของ Human Controller กลับเป็นปกติ
        this.reactionContext = null;
        this.inputState = "idle";
        // ส่งคำตอบให้ ReactionManager ประมวลผลต่อ
        return this.game.reactionManager.resolveReaction(useReaction);
        
    }
    // รับคำตอบจากปุ่ม UI (ใช้ / ไม่ใช้) แล้วส่งไปประมวลผลที่ Trigger Skill
    resolveTriggerChoice(useSkill){
        if(this.inputState !== "waitingTriggerChoice"){
            return;
        }
        
        const skill = this.selectedTriggerSkill;
        const context = this.triggerContext;
        
        if(!skill){
            return;
        }
        // ส่งคำตอบให้ Trigger Skill ประมวลผล
        const success = skill.resolveChoice(
            this.player, 
            this.game, 
            context, 
            useSkill
        );
        // Trigger ที่มีขั้นตอนต่อไม่ต้องล้าง State
        if(
            this.inputState === "waitingTriggerChoice" || 
            this.inputState === "waitingTriggerCard" || 
            this.inputState === "waitingTriggerTarget"
        ){
            this.game.ui.render();
            return success;
        }
        // ล้าง State กลับเป็น idle
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        // ถ้า Trigger นี้เกิดหลัง Damage ระหว่าง Pending Slash
        if(this.pendingSlashTriggerAfterDamage){
            return this.resumePendingSlashAfterTrigger();
        }

        this.game.afterHumanAction(success);

        return success;
    }
    // เริ่มสถานะรอเลือกการ์ดจากมือสำหรับ Trigger Skill
    startTriggerCardSelection(skill, context){
        this.selectedTriggerSkill = skill;
        this.triggerContext = context;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        this.inputState = "waitingTriggerCard";

        this.game.ui.render();
    }
    // เริ่มต้นสถานะเลือกการ์ด 2 ใบสำหรับ Frost Sword
    startFrostSwordCardSelection(skill, context){

        this.selectedTriggerSkill = skill;
        this.triggerContext = context;
        this.selectedFrostSwordCards = [];
        this.inputState = "waitingFrostSwordCard";
        this.game.ui.render();
    }
    // เริ่มต้นสถานะรอเลือกเป้าหมายเพิ่มเติม
    startAdditionalTargetSelection(context, maxTargets){

        this.selectedAdditionalTargets = [];
        this.additionalTargetLimit = maxTargets;
        this.additionalTargetContext = context;
        this.inputState = "waitingAdditionalTargets";
        this.game.ui.render();
    }
    // บันทึกการ์ดจากมือที่ถูกเลือกสำหรับ Trigger แล้วเปลี่ยนสถานะไปรอเลือกเป้าหมายที่สอง
    selectTriggerCard(index){
        if(this.inputState !== "waitingTriggerCard"){
            return;
        }

        const skill = this.selectedTriggerSkill;
        if(!skill){
            return;
        }
        // ดึงการ์ดตาม index
        const card = this.player.hand.cards[index];
        if(!card){
            return;
        }
        // ตรวจสอบเงื่อนไขว่าสกิลอนุญาตให้เลือกการ์ดใบนี้หรือไม่
        if(
            typeof skill.canSelectTriggerCard === "function" && 
            !skill.canSelectTriggerCard(this.player, card, this.triggerContext)
        ){
            return;
        }
        // ป้องกันเลือกการ์ดใบเดิมซ้า 
        if(this.selectedTriggerCardIndices.includes(index)){
            return;
        }
        // เก็บ Index การ์ดที่เลือก
        this.selectedTriggerCardIndices.push(index);
        this.selectedTriggerCardIndex = index;

        console.log(
            "Trigger Card Selection =", 
            this.selectedTriggerCardIndices
        );
        // Trigger กำหนดเองได้ว่าต้องใช้การ์ดกี่ใบ
        const requiredCount = 
            typeof skill.triggerCardSelectionCount === "function" 
                ? skill.triggerCardSelectionCount(this.player, this.game) : 1;
        // ถ้ายังเลือกไม่ครบ ให้รอเลือกใบต่อไป
        if(this.selectedTriggerCardIndices.length < requiredCount){
            this.game.ui.render();
            return;
        }
        // แปลง Index ที่เลือกเป็นการ์ดจริง
        const cards = this.selectedTriggerCardIndices.map(
            selectedIndex => this.player.hand.cards[selectedIndex]
        );
        // ส่งการ์ดหลายใบเข้า Trigger Context
        this.triggerContext.cards = cards;
        this.triggerContext.card = cards[0];
        // Trigger ที่ใช้การ์ดหลายใบสามารถประมวลผลทันทีหลังเลือกครบ
        if(typeof skill.resolveTriggerCards === "function"){
            const success = skill.resolveTriggerCards(
                this.player, 
                this.game, 
                this.triggerContext
            );
            
            this.selectedTriggerSkill = null;
            this.triggerContext = null;
            this.selectedTriggerCardIndex = -1;
            this.selectedTriggerCardIndices = [];
            this.inputState = "idle";
            this.selectedCardIndex = -1;
            this.selectedTarget = null;

            this.game.afterHumanAction(success);

            return success;
        }
        // เดิม: หากเป็น Trigger แบบเลือก Target ต่อ (เช่น ง้าวสามคม)
        this.inputState = "waitingTriggerTarget";

        this.game.ui.render();
    }
    // ยกเลิกการใช้ Trigger ระหว่างขั้นตอนเลือกการ์ด (เมื่อกดปุ่มไม่ใช้)
    cancelTriggerCardSelection(){

        if(this.inputState !== "waitingTriggerCard"){
            return;
        }

        const skill = this.selectedTriggerSkill;
        const context = this.triggerContext;

        if(!skill || !context){
            return;
        }
        // เรียกใช้เมธอดยกเลิกของ Skill เพื่อ Resume กระบวนการเดิม
        const success = skill.cancelTriggerCardSelection(
            this.player, 
            this.game, 
            context
        );
        // รีเซ็ตสถานะ Controller กลับสู่ idle
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.selectedTriggerCardIndices = [];
        this.inputState = "idle";
        // แจ้งการทำงานเสร็จสิ้นแก่ Game
        this.game.afterHumanAction(success);

        return success;
    }
    // ตรวจสอบและบันทึกเป้าหมายที่สองสำหรับ Trigger แล้วส่งไปประมวลผลผลลัพธ์ของสกิล
    selectTriggerTarget(player){
        if(this.inputState !== "waitingTriggerTarget"){
            return;
        }
        
        const skill = this.selectedTriggerSkill;
        if(!skill){
            return;
        }
        // ตรวจสอบว่าเป้าหมายที่เลือกถูกต้องตามเงื่อนไขของ Trigger Skill หรือไม่
        if(!skill.canTriggerTarget(
            this.player, 
            player, 
            this.game, 
            this.triggerContext
        )){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }
        
        this.triggerContext.secondaryTarget = player;
        // เรียกประมวลผลผลลัพธ์ของ Trigger Skill
        const success = skill.resolveTriggerTarget(
            this.player, 
            this.game, 
            this.triggerContext
        );
        // ล้าง State กลับสู่ปกติ
        this.selectedTriggerSkill = null;
        this.triggerContext = null;
        this.selectedTriggerCardIndex = -1;
        this.inputState = "idle";

        this.game.afterHumanAction(success);

        return success;
    }
    // เลือกผู้เล่นเป้าหมายเพิ่มเติม
    selectAdditionalTarget(player){

        if(this.inputState !== "waitingAdditionalTargets"){
            return;
        }
        // ห้ามเลือกตัวเอง
        if(player === this.player){
            return;
        }
        // ห้ามเลือกเป้าหมายหลักซ้ำ
        if(
            this.additionalTargetContext && 
            player === this.additionalTargetContext.primaryTarget
        ){
            return;
        }
        // ถ้าคลิกเป้าหมายที่เลือกไว้แล้ว ให้ยกเลิกการเลือก (Unselect)
        const selectedIndex = this.selectedAdditionalTargets.indexOf(player);
        if(selectedIndex !== -1){

            this.selectedAdditionalTargets.splice(selectedIndex, 1);
            console.log("ยกเลิกเป้าหมายเพิ่มเติม:", player.name);
            this.game.ui.render();
            return;
        }
        // ตรวจจำนวนสูงสุด
        if(
            this.selectedAdditionalTargets.length >= 
            this.additionalTargetLimit
        ){
            return;
        }
        this.selectedAdditionalTargets.push(player);
        this.game.ui.render();
    }
    // ยืนยันการเลือกเป้าหมายเพิ่มเติมทั้งหมด แล้วรวบรวมเป้าหมายส่งกลับเข้า Context
    finishAdditionalTargetSelection(){
        // ตรวจสอบสถานะว่ากำลังอยู่ในช่วงรอเลือกเป้าหมายเพิ่มเติมหรือไม่
        if(this.inputState !== "waitingAdditionalTargets"){
            return;
        }
        // ดึง Context ของง้าวฟ้าทะลวงที่บันทึกไว้
        const context = this.additionalTargetContext;
        if(!context){
            return;
        }
        // รวบรวมเป้าหมายหลัก (primaryTarget) และเป้าหมายเพิ่มเติม
        const targets = [
            context.primaryTarget, 
            ...this.selectedAdditionalTargets
        ];
        // บันทึกเป้าหมายทั้งหมดกลับเข้า Context
        context.targets = targets;
        // เก็บ Context ไว้รอ Resume Slash ในอนาคต
        this.pendingSlashContext = context;

        console.log(
            "ง้าวฟ้าทะลวง เลือกเป้าหมายแล้ว:", 
            targets.map(target => target.name)
        );
        // รีเซ็ต State ตัวควบคุมกลับเป็น idle และล้างตัวแปรเลือกเป้าหมาย
        this.inputState = "idle";
        this.additionalTargetContext = null;
        this.additionalTargetLimit = 0;
        this.selectedAdditionalTargets = [];
        // เริ่มประมวลผลเป้าหมายแรกทันที
        const success = this.startPendingSlashResolution();
        if(!success){
            this.game.ui.render();
            return;
        }
        this.game.ui.render();
    }
    // เริ่มเข้าสู่ State เลือกเป้าหมายที่ 2 ของการ์ดยืมดาบสังหาร
    startBorrowedSwordTargetSelection(context){

        this.borrowedSwordContext = context;
        this.selectedBorrowedSwordTarget = null;
        this.inputState = "waitingBorrowedSwordTarget";
        this.game.ui.render();
    }
    // ตรวจสอบว่า Target สามารถเป็นเป้าหมายที่ 2
    canSelectBorrowedSwordTarget(player){

        if(this.inputState !== "waitingBorrowedSwordTarget"){
            return false;
        }
        // ผู้ใช้ Borrowed Sword ห้ามเป็นเป้าหมายที่ 2
        if(player === this.player){
            return false;
        }

        const context = this.borrowedSwordContext;
        if(!context || !context.attacker || !context.slashCard){
            return false;
        }
        return context.slashCard.card.canTarget(context.attacker, player);
    }
    // รับการเลือกเป้าหมายที่ 2 และตรวจสอบระยะทำการโจมตีของผู้ถูกบังคับ
    selectBorrowedSwordTarget(player){

        if(this.inputState !== "waitingBorrowedSwordTarget"){
            return;
        }

        const context = this.borrowedSwordContext;
        if(!context || !context.attacker || !context.slashCard){
            return;
        }
        // เป้าหมายที่ 2 ต้องอยู่ในระยะโจมตีของผู้ถูกบังคับ (attacker)
        if(!this.canSelectBorrowedSwordTarget(player)){
            this.game.log("ไม่สามารถเลือกเป้าหมายนี้ได้");
            return;
        }

        this.selectedBorrowedSwordTarget = player;
        this.borrowedSwordContext.secondaryTarget = player;
        console.log("Borrowed Sword เป้าหมายที่ 2 :", player.name);
        // ดึงการ์ดโจมตีที่ถูกบังคับให้นำมาใช้
        const attacker = context.attacker;
        const slashCard = context.slashCard.card;
        const slashCardIndex = context.slashCard.index;
        // นำการ์ดโจมตีออกจากมือของผู้ถูกบังคับ
        const removeSlash = attacker.hand.removeCard(slashCardIndex);
        if(!removeSlash){
            this.game.log(attacker.name + " ไม่สามารถใช้โจมตีได้");
            return;
        }
        // ทิ้งการ์ดโจมตีลงกองทิ้ง
        this.game.discardPile.addCard(removeSlash);
        // บันทึกว่าผู้ถูกบังคับใช้โจมตีแล้ว
        attacker.markSlashUsed();
        // ประมวลผลการโจมตีไปยังเป้าหมายที่ 2
        const success = slashCard.resolveSlashTarget(attacker, player, this.game);
        // ล้าง Borrowed Sword State
        this.inputState = "idle";
        this.borrowedSwordContext = null;
        this.selectedBorrowedSwordTarget = null;
        this.selectedCardIndex = -1;
        this.game.ui.render();
        // ส่ง Flow กลับไปยังผู้เล่นที่ใช้ Borrowed Sword
        this.game.afterHumanAction(success);
    }
    // เตรียมคิวรายชื่อเป้าหมาย Slash จาก Context และตั้งค่า Index เริ่มต้นที่ 0
    preparePendingSlashTargets(context){
        
        if(!context || !Array.isArray(context.targets)){
            return false;
        }
        
        this.pendingSlashContext = context;
        this.pendingSlashTargets = [...context.targets];
        this.pendingSlashTargetIndex = 0;
        console.log("เตรียมเป้าหมาย Slash:", 
            this.pendingSlashTargets.map(target => target.name)
        );
        return true;
    }
    // เริ่มต้นเตรียมคิวเป้าหมายและยิงประมวลผล Slash เป้าหมายแรกทันที
    startPendingSlashResolution(){

        if(!this.pendingSlashContext){
            console.log("ไม่พบ Pending Slash Context");
            return false;
        }
        // เตรียมคิวเป้าหมายทั้งหมดลง pendingSlashTargets
        const success = this.preparePendingSlashTargets(this.pendingSlashContext);
        if(!success){
            return false;
        }
        return this.resolvePendingSlashTargets();
    }
    // ดึงออบเจกต์เป้าหมายปัจจุบันตามตำแหน่ง pendingSlashTargetIndex
    getPendingSlashTarget(){
        
        if(
            this.pendingSlashTargetIndex < 0 || 
            this.pendingSlashTargetIndex >= this.pendingSlashTargets.length
        ){
            return null;
        }
        return this.pendingSlashTargets[this.pendingSlashTargetIndex];
    }
    // เลื่อนตำแหน่ง Index ไปยังเป้าหมายถัดไป (+1) แล้วคืนค่าเป้าหมายใหม่
    advancePendingSlashTarget(){

        this.pendingSlashTargetIndex++;
        return this.getPendingSlashTarget();
    }
    // ตรวจสอบว่า Pending Slash ประมวลผลครบทุกเป้าหมายแล้วหรือยัง
    isPendingSlashComplete(){
        return (
            this.pendingSlashTargetIndex >= 
            this.pendingSlashTargets.length
        );
    }
    // ประมวลผล Slash สำหรับเป้าหมายปัจจุบันในคิว และเลื่อน Index ถัดไปเมื่อประมวลผลสำเร็จ
    resolvePendingSlashTarget(){
        
        const target = this.getPendingSlashTarget();
        if(!target){
            console.log("ไม่มีเป้าหมาย Slash ที่รอประมวลผล");
            return false;
        }

        const context = this.pendingSlashContext;
        if(!context){
            console.log("ไม่พบ Pending Slash Context");
            return false;
        }
        
        const card = context.card;
        if(!card){
            console.log("ไม่พบ Slash Card ใน Pending Slash Context");
            return false;
        }
        console.log("กำลังประมวลผล Pending Slash", target.name);
        
        const success = card.resolveSlashTarget(this.player, target, this.game);
        if(success){
            // หาก Slash หยุดรอ Trigger ห้ามเลื่อน Index ไปเป้าหมายถัดไป
            if(
                this.inputState === "waitingTriggerChoice" || 
                this.inputState === "waitingTriggerCard" || 
                this.inputState === "waitingTriggerTarget"
            ){
                console.log("Pending Slash หยุดรอ Trigger", target.name);
                return true;
            }
            console.log("ประมวลผล Pending Slash สำเร็จ:", target.name);
            this.advancePendingSlashTarget();
        }
        return success;
    }
    // ประมวลผล Pending Slash ทุกเป้าหมายต่อเนื่อง โดยหยุดทันทีหากพบ Trigger ที่ต้องรอ Input
    resolvePendingSlashTargets(){

        if(!this.pendingSlashContext){
            console.log("ไม่พบ Pending Slash Context");
            return false;
        }
        // วนลูปประมวลผลจนกว่าจะครบทุกเป้าหมายในคิว
        while(!this.isPendingSlashComplete()){

            const success = this.resolvePendingSlashTarget();
            if(!success){
                return false;
            }
            // หากมี Trigger รอการตัดสินใจ ให้หยุดวนลูปชั่วคราว
            if(
                this.inputState === "waitingTriggerChoice" || 
                this.inputState === "waitingTriggerCard" || 
                this.inputState === "waitingTriggerTarget"
            ){
                console.log(
                    "Pending Slash หยุดรอ Trigger ที่ Target Index", 
                    this.pendingSlashTargetIndex
                );
                return true;
            }
        }
        console.log("Pending Slash ประมวลผลครบทุกเป้าหมาย");
        return this.finishPendingSlashResolution();
    }
    // ทำงานต่อหลัง Trigger afterDamage สิ้นสุด โดยเลื่อน Index ไปเป้าหมายถัดไป และประมวลผลต่อ
    resumePendingSlashAfterTrigger(){

        if(!this.pendingSlashContext){
            console.log("ไม่พบ Pending Slash Context สำหรับ Resume");
            return false;
        }
        
        if(!this.pendingSlashTriggerAfterDamage){
            console.log("Pending Slash Trigger นี้ไม่ใช่ afterDamage");
            return false;
        }
        // Damage ของเป้าหมายปัจจุบันจบไปแล้ว ขยับไปเป้าหมายถัดไป
        this.pendingSlashTriggerAfterDamage = false;
        this.advancePendingSlashTarget();
        // ถ้าไม่มีเป้าหมายเหลือแล้ว ให้จบกระบวนการ
        if(this.isPendingSlashComplete()){
            return this.finishPendingSlashResolution();
        }
        // ประมวลผล Target ถัดไปต่อ
        return this.resolvePendingSlashTargets();
    }
    // จบกระบวนการ Pending Slash และคืน Flow กลับสู่เกมปกติ
    finishPendingSlashResolution(){

        if(!this.isPendingSlashComplete()){
            console.log("Pending Slash ยังประมวลผลไม่ครบ");
            return false;
        }
        console.log("จบ Pending Slash ของง้าวฟ้าทะลวง");
        // ล้าง State ของ Pending Slash
        this.pendingSlashContext = null;
        this.pendingSlashTargets = [];
        this.pendingSlashTargetIndex = 0;
        // คืน Controller กลับสู่สถานะปกติ
        this.inputState = "idle";
        this.selectedCardIndex = -1;
        this.selectedTarget = null;
        // แจ้ง Game ว่า Action นี้เสร็จสมบูรณ์
        this.game.afterHumanAction(true);
        return true;
    }

}