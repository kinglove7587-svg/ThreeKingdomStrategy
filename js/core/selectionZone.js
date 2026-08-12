class SelectionZone{
    constructor(){
        this.cards = []; // การ์ดที่ถูกเปิดมาอยู่ในโซน
        this.players = []; // ผู้เล่นที่มีสิทธิ์เลือก
        this.currentPlayerIndex = 0; // Index ของผู้เล่นที่กำลังเลือก
    }
    // เริ่มรอบการเลือกการ์ดร่วมกัน
    startSelection(cards, players){
        this.cards = [...cards];
        this.players = [...players];
        this.currentPlayerIndex = 0;
    }
    // ล้างข้อมูลทั้งหมดใน Zone
    clear(){
        this.cards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
    }
    // เพิ่มการ์ดเข้า Zone
    addCard(card){
        this.cards.push(card);
    }
    // นำการ์ดออกจาก Zone ตาม Index ที่ระบุ
    removeCard(index){
        if(index < 0 || index >= this.cards.length){
            return null;
        }
        return this.cards.splice(index, 1)[0];
    }
    // กำหนดรายชื่อผู้เล่นที่มีสิทธิ์เลือก
    setPlayers(players){
        this.players = [...players];
        this.currentPlayerIndex = 0;
    }
    // คืนค่าผู้เล่นที่กำลังมีสิทธิ์เลือกในปัจจุบัน
    getCurrentPlayer(){
        if(this.players.length === 0){
            return null;
        }
        return this.players[this.currentPlayerIndex];
    }
    // เลื่อนไปยังผู้เล่นคนถัดไป
    nextPlayer(){
        if(this.players.length === 0){
            return null;
        }
        this.currentPlayerIndex++;
        if(this.currentPlayerIndex >= this.players.length){
            this.currentPlayerIndex = 0;
        }
        return this.getCurrentPlayer();
    }
    // ตรวจสอบว่ายังมีการ์ดเหลือใน Zone หรือไม่
    hasCards(){
        return this.cards.length > 0;
    }
    // ตรวจสอบว่าการเลือกการ์ดจบหรือยัง
    isFinish(){
        return this.cards.length === 0;
    }
    // เลื่อนไปยังผู้เล่นคนถัดไปที่มีสิทธิ์เลือก
    advancePlayer(){
        if(this.players.length === 0){
            return null;
        }
        
        this.currentPlayerIndex++;
        // หากดัชนีเกินจำนวนผู้เล่น ให้วนกลับมาที่ผู้เล่นคนแรก (index 0)
        if(this.currentPlayerIndex >= this.players.length){
            this.currentPlayerIndex = 0;
        }
        
        return this.getCurrentPlayer();
    }
}