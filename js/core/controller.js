class Controller{
    // กำหนด constructor รับอินสแตนซ์ของผู้เล่น game เข้ามาผูกกับ Controller
    constructor(game){
        // เก็บอ้างอิงถึง Game
        this.game = game;
        // กำหนดค่าเริ่มต้นของ player เป็น null ไว้ก่อน
        this.player = null;
    }
    // รับออบเจกต์ผู้เล่น (Player) มาผูกไว้ใช้งาน
    setPlayer(player){
        // ผูกออบเจกต์ player เข้ากับ controller
        this.player = player;
    }
    // เมธอดสำหรับเลือกการ์ด ให้คลาสลูกเช่น AIController นำไป override เขียน Logic การเลือกจริง
    chooseCard(){
        // คืนค่า -1 เป็นค่าเริ่มต้น หมายถึงยังไม่ได้เลือกการ์ดใบใด
        return -1;
    }
    // เริ่มต้น Play Phase ของ Controller
    playTurn(){
        //
    }
    // เมธอดสำหรับให้ Controller สั่งเล่นการ์ดตามตำแหน่งที่ระบุ
    playCard(cardIndex){
        // เรียกใช้ฟังก์ชันของ Game เพื่อประมวลผลการเล่นการ์ดใบนั้น
        return this.game.playCardFromCurrentPlayer(cardIndex);
    }
    // คืนค่าผู้เล่นเป้าหมายที่ Controller เลือก (ค่าเริ่มต้นคืนค่า null)
    getTarget(card){
        return null;
    }
    // ตรวจสอบว่า Controller กำลังรอการตอบรับ/กดปุ่มจากผู้เล่นหรือไม่ (ค่าเริ่มต้นคืนค่า false)
    isWaitingInput(){
        return false;
    }
    // ตอบกลับการขอการ์ด "โจมตี" (คืนค่า -1 เป็นค่าเริ่มต้น/ไม่มีการ์ด)
    askSlash(player, game){
        return -1;
    }
    //
    isHuman(){
        return false;
    }
    //
    askPeach(player, game){
        return -1;
    }
    //
    isWaitingPeach(){
        return false;
    }
    // เริ่มต้น Reaction สำหรับ Controller
    startReaction(context){
        return false;
    }
    // กำหนดสถานะพื้นฐานเป็น waitingSelection
    startSelection(){
        this.inputState = "waitingSelection";
    }
    // คืนสถานะกลับเป็น idle
    finishSelection(){
        this.selectedCardIndex = -1;
        this.inputState = "idle";
    }
}
