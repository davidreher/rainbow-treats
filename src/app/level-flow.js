export class LevelFlow {
  constructor(levels, initialProgress) {
    this._levels = levels;
    this._progress = initialProgress;
  }

  get progress() {
    return this._progress;
  }

  getLevel(levelId) {
    return this._levels.find(level => level.id === levelId) ?? null;
  }

  isUnlocked(levelId) {
    return levelId <= this._progress.highestUnlockedLevel;
  }

  canResume() {
    return Boolean(this._progress.resumeSession && this.isUnlocked(this._progress.resumeSession.levelId));
  }

  applyLevelEnd(levelDef, boardState) {
    const won = boardState.score >= levelDef.targetScore;
    const lost = boardState.movesLeft <= 0 && !won;

    const best = this._progress.bestScoresByLevel[levelDef.id] ?? 0;
    const newBest = Math.max(best, boardState.score);

    const nextUnlock = won
      ? Math.min(this._levels.length, Math.max(this._progress.highestUnlockedLevel, levelDef.id + 1))
      : this._progress.highestUnlockedLevel;

    this._progress = {
      ...this._progress,
      highestUnlockedLevel: nextUnlock,
      bestScoresByLevel: {
        ...this._progress.bestScoresByLevel,
        [levelDef.id]: newBest,
      },
      lastPlayedLevelId: levelDef.id,
      resumeSession: null,
      updatedAt: new Date().toISOString(),
    };

    const detail = {
      levelId: levelDef.id,
      score: boardState.score,
      bestScore: newBest,
      highestUnlockedLevel: nextUnlock,
      movesLeft: boardState.movesLeft,
      won,
      lost,
    };

    if (won) {
      document.dispatchEvent(new CustomEvent('level-won', { bubbles: true, detail }));
    } else if (lost) {
      document.dispatchEvent(new CustomEvent('level-lost', { bubbles: true, detail }));
    }

    return detail;
  }

  writeResume(boardState) {
    this._progress = {
      ...this._progress,
      lastPlayedLevelId: boardState.levelId,
      resumeSession: {
        levelId: boardState.levelId,
        boardState,
        score: boardState.score,
        movesLeft: boardState.movesLeft,
        activeComboChain: boardState.comboChain ?? 0,
        savedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    return this._progress;
  }

  clearResume() {
    this._progress = {
      ...this._progress,
      resumeSession: null,
      updatedAt: new Date().toISOString(),
    };
    return this._progress;
  }
}
