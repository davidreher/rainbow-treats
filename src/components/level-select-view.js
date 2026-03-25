export class LevelSelectView {
  constructor(rootId = 'level-grid') {
    this._root = document.getElementById(rootId);
  }

  render(levels, progress) {
    if (!this._root) return;
    this._root.innerHTML = '';

    for (const level of levels) {
      const unlocked = level.id <= progress.highestUnlockedLevel;
      const best = progress.bestScoresByLevel[level.id] ?? null;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `level-btn${unlocked ? '' : ' level-btn--locked'}`;
      btn.disabled = !unlocked;
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', unlocked ? `Play level ${level.id}` : `Level ${level.id} locked`);

      const num = document.createElement('span');
      num.className = 'level-btn__num';
      num.textContent = String(level.id);

      const score = document.createElement('span');
      score.className = 'level-btn__score';
      score.textContent = best !== null ? `★ ${best.toLocaleString()}` : (unlocked ? 'Play' : '🔒');

      btn.appendChild(num);
      btn.appendChild(score);

      if (unlocked) {
        btn.addEventListener('click', () => {
          document.dispatchEvent(new CustomEvent('level-selected', {
            bubbles: true,
            detail: { levelId: level.id },
          }));
        });
      }

      this._root.appendChild(btn);
    }
  }
}
