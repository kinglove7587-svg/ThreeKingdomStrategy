class Card {
    constructor(type, name, suit, number) {
        this.type = type;
        this.name = name;
        this.suit = suit;
        this.number = number;
    }

    use(player, game){ // ความสามารถเริ่มต้นของไพ่
        console.log(this.name + " ยังไม่มีความสามารถ");
        return false;
    }
    // การ์ดทั่วไปไม่ต้องเลือกเป้าหมาย
    needTarget(){
        return false;
    }
    // ค่าเริ่มต้น: สามารถเลือกผู้เล่นคนไหนเป็นเป้าหมายก็ได้
    canTarget(player,target){
        return true;
    }
    // กำหนดว่าเมื่อใช้งานการ์ดใบนี้แล้ว ควรย้ายลงกองทิ้ง (discardPile) หรือไม่
    shouldDiscard(){
        return true;
    }
    //
    canRecast(){
        return false;
    }
}
