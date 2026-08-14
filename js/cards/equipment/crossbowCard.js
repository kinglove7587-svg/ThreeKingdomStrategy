class CrossbowCard extends WeaponCard{
    // ตัวสร้างการ์ดกำหนดชื่อ "จูเก่อเหลียนหนู", ดอก/สี (suit), หมายเลข (number) และระยะโจมตีเป็น 1
    constructor(suit, number){
        super("จูเก่อเหลียนหนู", suit, number, 1);
    }
    // Hook ทำงานเมื่อผู้เล่นสวมใส่: ปรับสถานะให้ใช้การ์ด "โจมตี" ได้ไม่จำกัดครั้งในเทิร์นนี้
    onEquip(player){
        // เปิดใช้งานสถานะยิงโจมตีได้ไม่จำกัด
        player.infiniteSlash = true;
        console.log(player.name + " สวมจูเก่อเหลียนหนู");
    }
    // Hook ทำงานเมื่อผู้เล่นถอดออก (หรือสวมอาวุธอื่นแทน): ยกเลิกสถานะยิงไม่จำกัด
    onUnequip(player){
        // ปิดใช้งานสถานะยิงโจมตีได้ไม่จำกัด
        player.infiniteSlash = false;
        console.log(player.name + " ถอดจูเก่อเหลียนหนู");
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "อาวุธระยะ 1 เมื่อสวมใส่ สามารถใช้ โจมตี ได้ไม่จำกัดครั้งในเทิร์นนี้";
    }
}