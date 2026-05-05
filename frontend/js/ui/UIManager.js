class UIManager {
    getElement(id) {
        return document.getElementById(id);
    }

    updateHUD(hp, gold, wave, maxWaves, score) {
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
