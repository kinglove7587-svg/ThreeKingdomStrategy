class ShadowrunnerCard extends MountCard{
    constructor(suit, number){
        super("ม้าเงาพยับ", suit, number, 0,  1);
    }
    // คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ม้า +1 ระยะการโจมตี"
    }
}