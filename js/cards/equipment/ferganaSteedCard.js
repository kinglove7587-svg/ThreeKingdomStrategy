class FerganaSteedCard extends MountCard{
    constructor(suit, number){
        super("ม้าต้าหยวน", suit, number, -1, 0);
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "ม้า ลดระยะห่างจากผู้เล่นอื่นลง 1";
    }
}