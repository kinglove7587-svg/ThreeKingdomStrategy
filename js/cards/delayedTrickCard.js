class DelayedTrickCard extends Card{
    // ตัวสร้างคลาสแม่ของการ์ดถุงอุบายหน่วงเวลา (Delayed Trick)
    constructor(name, suit, number){
        // สั่งเรียก constructor ของ Card โดยระบุประเภทเป็น "DelayedTrick"
        super("DelayedTrick", name, suit, number);
    }
    // ต้องเลือกเป้าหมาย
    needTarget(){
        return true;
    }
    // การ์ดประเภทนี้เมื่อเล่นแล้วจะไม่ลงกองทิ้งทันที (จะถูกไปแปะไว้หน้าตัวละครเป้าหมายก่อน)
    shouldDiscard(){
        return false;
    }
    // ถูกเรียกเมื่อถึง Judge Phase
    onJudge(player){
        //
    }
}