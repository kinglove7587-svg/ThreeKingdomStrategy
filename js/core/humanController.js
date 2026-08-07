class HumanController extends Controller{
    // ตัวสร้างวัตถุ กำหนดสถานะ Input เริ่มต้นเป็น idle, ล้างค่า index การ์ด (-1) และเป้าหมายที่เลือก (null)
    constructor(game){
        super(game);
        this.inputState = "idle"; // สถานะการรับ Input ปัจจุบัน
        this.selectedCardIndex = -1; // ดรรชนี (Index) ของการ์ดที่เลือกอยู่บนมือ
        this.selectedTarget = null; // ผู้เล่นเป้าหมายที่เลือก
    }
    // จัดการเทิร์นของผู้เล่นมนุษย์
    playTurn(){ 
        console.log("Human Turn");
        // สั่งให้ UIManager อัปเดตหน้าจอ UI ใหม่ เพื่อรอรับการตอบสนอง (กดการ์ด/กดปุ่ม) จากผู้เล่นมนุษย์
        this.game.ui.render();
        // ยังไม่รู้ผล เพราะกำลังรอผู้เล่นกด
        return null;
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
        // ถ้าการ์ดต้องเลือกเป้าหมาย (เช่น การ์ดฆ่า, ดวล) ให้ Render UI ใหม่ แล้วหยุดรอให้ผู้เล่นคลิกเลือกเป้าหมาย
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
    // คืนค่าผู้เล่นเป้าหมายที่ผู้เล่นมนุษย์เลือกไว้บน UI
    getTarget(card){
        // เรียกใช้ getSelectedTarget() เพื่อดึงเป้าหมายปัจจุบันที่ผู้เล่นเลือกไว้
        return this.getSelectedTarget();
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
    // สอบถามการ์ด "ฆ่า" สำหรับ HumanController
    askSlash(player, game){
        // ค้นหารายการการ์ด "ฆ่า" ทั้งหมดในมือของผู้เล่น
        const slashCards = player.hand.findSlashCards();
        // หากไม่มีการ์ด "ฆ่า" ในมือเลย ให้คืนค่า -1 (ไม่มีการ์ดให้เลือก)
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
    // ค้นหาดัชนีของการ์ด "ยา" ในมือของผู้เล่น
    askPeach(player){
        return player.hand.findCardIndexByName("ยา");
    }
}
