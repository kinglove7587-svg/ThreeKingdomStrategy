class ShadowrunnerCard extends MountCard{
    constructor(suit, number){
        super("ม้าเงาพยับ", suit, number, 0,  1);
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เมื่อคุณตกเป็นเป้าหมาย ระยะห่างจากผู้เล่นอื่นมายังคุณเพิ่มขึ้น 1 หน่วย"
    }
}