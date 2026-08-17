class BorrowedSwordCard extends TrickCard{
    // ตัวสร้างการ์ด Borrowed Sword
    constructor(suit, number){
        super("ยืมดาบสังหาร", suit, number);
    }
    // การ์ดใบนี้ต้องเลือก Target
    needTarget(){
        return true;
    }
    // Target ต้องมีอาวุธ และห้ามเลือกตัวเอง
    canTarget(player, target){

        if(player === target){
            return false;
        }

        if(!target.weapon){
            return false;
        }
        return true;
    }
    //  Effect จะทำในขั้นถัดไป
    use(player, game){

        const target = player.controller.getSelectedTarget();
        if(!target){
            return false;
        }
        console.log("→ เป้าหมาย : " + target.name);
        return true;
    }
    // คำอธิบายการ์ด
    getDescription(){
        return "เลือกผู้เล่นอื่นที่มีอาวุธ หากเป้าหมายมี โจมตี ให้บังคับใช้ โจมตี และผู้ใช้เป็นผู้เลือกเป้าหมายของการโจมตี ตามระยะของผู้ใช้อาวุธ มิฉะนั้นขโมยอาวุธ"
    }
}