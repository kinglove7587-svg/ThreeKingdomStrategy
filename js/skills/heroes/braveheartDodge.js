class BraveheartDodge extends TriggerSkill{

    constructor(){
        super("Braveheart Dodge");
    }
    //
    register(eventManager, player){

        const callback = (context, resolution) => {
            // ต้องเป็นการโจมตีที่มีเจ้าของ Braveheart Dodge เป็น Target
            if(!context || context.target !== player){
                return;
            }
            // ถ้า Dodge ถูกกำหนดให้ใช้ไม่ได้ ให้ข้าม Braveheart Dodge
            if(context.disableDodge){
                return;
            }
            // ถ้าโจมตีถูกป้องกันไปแล้ว ไม่ต้องเปิด Braveheart Dodge ซ้ำ
            if(context.dodge){
                return;
            }
            // ค้นหา SlashCard ที่สามารถใช้แทน Dodge ได้
            const slashCards = player.hand.cards.filter(
                card => card instanceof SlashCard
            );
            // ถ้าไม่มี SlashCard ไม่สามารถใช้ Braveheart Dodge ได้
            if(slashCards.length === 0){
                return;
            }
            // หยุด beforeDodge เพื่อรอการตัดสินใจของเจ้าของสกิล
            if(resolution){
                resolution.wait();
            }
            player.game.log("สกิล Braveheart Dodge ของ จูล่ง ทำงาน");
            // แสดง Modal สำหรับถามว่าจะใช้ Braveheart Dodge หรือไม่
            const showChoiceModal = () => {
                player.game.showModal({
                    owner: player, 
                    title: "Braveheart Dodge (ห้าวหาญ)", 
                    message: 
                        player.name + 
                        " ตกเป็นเป้าหมายของ [โจมตี]\n" + 
                        "ต้องการใช้ [โจมตี] แทน [หลบ] หรือไม่?", 
                    buttons: [
                        {
                            text: "ใช้", 
                            onClick: () => {
                                // ปิด Modal คำถามก่อนเข้าสู่ขั้นเลือกการ์ด
                                player.game.hideModal();
                                player.game.log(player.name + " ใช้ Braveheart Dodge");
                                // ค้นหา SlashCard ล่าสุดจากมืออีกครั้ง
                                const currentSlashCards = player.hand.cards.filter(
                                    card => card instanceof SlashCard
                                );
                                // ตรวจอีกครั้งว่ามี SlashCard ให้เลือกจริง
                                if(currentSlashCards.length === 0){
                                    showChoiceModal();
                                    return;
                                }
                                // สร้าง UI สำหรับเลือกเฉพาะ SlashCard
                                const content = player.game.ui.createCardSelectionContent(
                                    currentSlashCards, 
                                    (selectedCards) => {
                                        // รับการ์ดที่ผู้เล่นเลือกไว้
                                        if(
                                            !selectedCards || 
                                            selectedCards.length !== 1
                                        ){
                                            return;
                                        }
                                        console.log(
                                            player.name + 
                                            " เลือกการ์ด Braveheart Dodge:", 
                                            selectedCards[0]
                                        );
                                    }, 
                                    {
                                        // บังคับให้เลือก SlashCard เพียง 1 ใบ
                                        requiredCount: 1
                                    }
                                );
                                // เปิด Modal ขั้นเลือก SlashCard
                                player.game.showModal({
                                    owner: player, 
                                    title: "Braveheart Dodge (ห้าวหาญ)", 
                                    message: "เลือกการ์ด [โจมตี] 1 ใบเพื่อใช้แทน [หลบ]", 
                                    content: content, 
                                    buttons: [
                                        {
                                            text: "ยืนยัน", 
                                            onClick: () => {
                                                // ต้องเลือกการ์ดครบ 1 ใบก่อนยืนยัน
                                                if(!content.confirmSelection()){
                                                    return;
                                                }
                                                // ดึง SlashCard ที่เลือกจากระบบ Selection
                                                const selectedCards = content.getSelectedCards();
                                                // ต้องมีการ์ดที่เลือกเพียง 1 ใบ
                                                if(
                                                    !selectedCards || 
                                                    selectedCards.length !== 1
                                                ){
                                                    return;
                                                }
                                                // ตรวจว่าการ์ดที่เลือกยังเป็น SlashCard
                                                const selectedCard = selectedCards[0];
                                                if(!(selectedCard instanceof SlashCard)){
                                                    return;
                                                }
                                                // ตรวจว่าการ์ดที่เลือกยังอยู่ในมือจริง
                                                const cardIndex = 
                                                    player.hand.cards.indexOf(selectedCard);
                                                if(cardIndex === -1){
                                                    return;
                                                }
                                                // นำ SlashCard ที่เลือกออกจากมือ
                                                const usedCard = player.hand.removeCard(cardIndex);
                                                if(!usedCard){
                                                    return;
                                                }
                                                // ทิ้ง SlashCard ที่ใช้เป็น Dodge ลงกองทิ้ง
                                                player.game.discardPile.addCard(usedCard);
                                                // กำหนดให้ Dodge สำเร็จแทน askDodge()
                                                context.dodge = true;
                                                // บันทึกจำนวน Dodge ที่ต้องใช้ให้หมดทันที
                                                context.requiredDodgeCount = 0;
                                                player.game.log(
                                                    player.name + " ใช้ [โจมตี] แทน [หลบ] ด้วย Braveheart Dodge"
                                                );
                                                // ปิด Modal และกลับเข้าสู่ beforeDodge Flow
                                                player.game.hideModal();
                                                // Resume Trigger Queue กลับไปยัง Slash เดิม
                                                if(resolution){
                                                    resolution.resume();
                                                }
                                            }
                                        }, 
                                        {
                                            text: "ยกเลิก", 
                                            onClick: () => {
                                                player.game.hideModal();
                                                // กลับไปถามว่าจะใช้ Braveheart Dodge หรือไม่
                                                showChoiceModal();
                                            }
                                        }
                                    ]
                                });
                            }
                        }, 
                        {
                            text: "ไม่ใช้", 
                            onClick: () => {
                                player.game.hideModal();
                                player.game.log(player.name + " ไม่ใช้ Braveheart Dodge");
                                if(resolution){
                                    resolution.resume();
                                }
                            }
                        }
                    ]
                });
            };
            // เริ่มต้นด้วย Modal ถามว่าจะใช้ Braveheart Dodge หรือไม่
            showChoiceModal();
        };
        // Braveheart Dodge ทำงานก่อนขั้นตอน Dodge ปกติ
        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}