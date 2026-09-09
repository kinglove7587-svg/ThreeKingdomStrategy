class FerganaSteedCard extends MountCard{
    constructor(suit, number){
        super("ม้าต้าหยวน", suit, number, -1, 0);
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เมื่อคุณเป็นฝ่ายกระทำ ระยะห่างจากคุณไปยังผู้เล่นอื่นลดลง 1 หน่วย";
    }
}