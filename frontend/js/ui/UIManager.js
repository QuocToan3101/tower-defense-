class UIManager {
    getElement(id) {
        return document.getElementById(id);
    }
//  4.1.6 ; 4.3.1 update HUD
    updateHUD(hp, gold, wave, maxWaves, score) {
        // BƯỚC 2a / 3a: Đồng bộ HUD sau khi trừ HP hoặc cộng thưởng từ quái.
        this.getElement('hud-hp').textContent = hp;
        this.getElement('hud-gold').textContent = gold;
        this.getElement('hud-wave').textContent = `${wave} / ${maxWaves}`;
        this.getElement('hud-score').textContent = score;
    }

    setLevelTitle(title) {
        const el = this.getElement('hud-title');
        if (el) {
            el.textContent = title;
        }
    }
}






























