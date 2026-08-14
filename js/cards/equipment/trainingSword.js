class TrainingSword extends WeaponCard{
    // ตัวสร้างการ์ดกำหนดชื่อ "ดาบฝึก", ดอก/สี (suit), หมายเลข (number) และระยะโจมตีเป็น 2
    constructor(suit, number){
        super("ดาบฝึก", suit, number,2);
    }
    // Hook ทำงานอัตโนมัติเมื่อผู้เล่นทำการสวมใส่อาวุธชิ้นนี้
    onEquip(player){
        console.log(player.name + " ได้รับพลังจากดาบฝึก");
    }
    // Hook ทำงานอัตโนมัติเมื่อถอดอาวุธชิ้นนี้ออกจากตัว (หรือถูกสวมใส่อาวุธใหม่แทนที่)
    onUnequip(player){
        console.log(player.name + " สูญเสียพลังจากดาบฝึก");
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "อาวุธระยะ 2 ไม่มีความสามารถพิเศษ";
    }
}