/**
 * bootstrap.js — Application entry point.
 *
 * Responsibilities (Phase 3 MVP):
 *   - Create view instances (BoardView, HudView)
 *   - Generate an initial BoardState from level 1
 *   - Wire swap events from BoardView → GameController → re-render
 *   - Animate each resolution phase with appropriate delays
 *   - Handle HUD controls (exit, retry)
 *   - Initialize screen routing and start on the game screen
 *
 * Phase 4 additions: level select, modal win/lose, persistence.
 * Phase 5 additions: service worker registration already in index.html.
 */

import { generateBoard }   from '../engine/board-generator.js';
import { LEVELS, getLevel } from '../engine/levels.js';
import { GameController }  from './game-controller.js';
import { LevelFlow }       from './level-flow.js';
import { BoardView }       from '../components/board-view.js';
import { HudView }         from '../components/hud-view.js';
import { LevelSelectView } from '../components/level-select-view.js';
import { ModalView }       from '../components/modal-view.js';
import { ToastView }       from '../components/toast-view.js';
import { showScreen, initRouter } from './screen-router.js';
import { loadProgress, saveProgress } from '../storage/progress-store.js';

// ── Module-level state ────────────────────────────────────────────────────────
let gameController = null;
let boardView      = null;
let hudView        = null;
let levelSelectView = null;
let modalView       = null;
let toastView       = null;
let levelFlow       = null;
let activeLevelDef = null;
let isProcessing   = false;
let modalContext   = null;

// ── Timing helpers ────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── HUD snapshot helper ───────────────────────────────────────────────────────
function hudSnapshot(state, levelDef) {
  return {
    levelId:     levelDef.id,
    score:       state.score,
    movesLeft:   state.movesLeft,
    targetScore: levelDef.targetScore,
  };
}

// ── Level start ───────────────────────────────────────────────────────────────
function startLevel(levelDef, options = {}) {
  activeLevelDef = levelDef;
  const boardState = options.resumeState ?? generateBoard(levelDef);
  gameController   = new GameController(levelDef, boardState);
  isProcessing     = false;

  modalView.hide();
  showScreen('game');
  boardView.render(boardState);
  hudView.update(hudSnapshot(boardState, levelDef));

  levelFlow.writeResume(boardState);
  saveProgress(levelFlow.progress);
}

function showLevelSelect() {
  levelSelectView.render(LEVELS, levelFlow.progress);
  showScreen('level-select');
}

function showWinModal(summary) {
  modalContext = {
    type: 'won',
    levelId: summary.levelId,
    nextLevelId: summary.levelId + 1,
  };

  modalView.show({
    title: `Level ${summary.levelId} Complete!`,
    message: `Score: ${summary.score.toLocaleString()} • Best: ${summary.bestScore.toLocaleString()}`,
    actions: [
      { id: 'next-level', label: 'Next Level', primary: true },
      { id: 'retry-level', label: 'Replay Level' },
      { id: 'to-level-select', label: 'Level Select' },
    ],
  });
}

function showLoseModal(summary) {
  modalContext = {
    type: 'lost',
    levelId: summary.levelId,
  };

  modalView.show({
    title: `Level ${summary.levelId} Failed`,
    message: `Final score: ${summary.score.toLocaleString()} • Try again?`,
    actions: [
      { id: 'retry-level', label: 'Retry', primary: true },
      { id: 'to-level-select', label: 'Level Select' },
    ],
  });
}

// ── Swap handler ──────────────────────────────────────────────────────────────
async function handleSwap({ from, to }) {
  if (isProcessing || !gameController) return;
  isProcessing = true;

  const result = gameController.processSwap(from, to);

  if (result.result === 'busy') {
    isProcessing = false;
    return;
  }

  if (result.result === 'invalid') {
    // Show brief swap preview then revert + shake
    for (const phase of result.phases) {
      boardView.render(phase.state);
      if (phase.duration > 0) await delay(phase.duration);
    }
    // Render reverted state then shake
    boardView.render(gameController.getBoardState());
    boardView.shakeInvalidSwap(from, to);
    await delay(340); // shake animation duration
    isProcessing = false;
    return;
  }

  // ── Animate each resolution phase ─────────────────────────────────────────
  for (const phase of result.phases) {
    boardView.render(phase.state);
    hudView.update(hudSnapshot(phase.state, activeLevelDef));
    if (phase.duration > 0) await delay(phase.duration);
  }

  const latest = result.boardState;
  levelFlow.writeResume(latest);
  saveProgress(levelFlow.progress);

  isProcessing = false;

  if (result.result === 'won' || result.result === 'lost') {
    const summary = levelFlow.applyLevelEnd(activeLevelDef, latest);
    saveProgress(levelFlow.progress);
    if (summary.won) showWinModal(summary);
    if (summary.lost) showLoseModal(summary);
  }
}

function handleModalAction(action) {
  if (!modalContext) {
    modalView.hide();
    return;
  }

  if (modalContext.type === 'resume') {
    if (action === 'resume-yes') {
      const session = levelFlow.progress.resumeSession;
      if (session) {
        startLevel(getLevel(session.levelId), { resumeState: session.boardState });
      }
    } else if (action === 'resume-no') {
      levelFlow.clearResume();
      saveProgress(levelFlow.progress);
      modalView.hide();
    }
    return;
  }

  if (action === 'retry-level') {
    startLevel(getLevel(modalContext.levelId));
    return;
  }

  if (action === 'to-level-select') {
    modalView.hide();
    showLevelSelect();
    return;
  }

  if (action === 'next-level') {
    const id = modalContext.nextLevelId;
    const exists = LEVELS.some(level => level.id === id);
    if (exists && levelFlow.isUnlocked(id)) {
      startLevel(getLevel(id));
    } else {
      showLevelSelect();
    }
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
function init() {
  levelFlow = new LevelFlow(LEVELS, loadProgress());
  boardView = new BoardView();
  hudView   = new HudView();
  levelSelectView = new LevelSelectView();
  modalView = new ModalView();
  toastView = new ToastView();

  // Swap requests emitted by BoardView
  document.addEventListener('swap-requested', (e) => handleSwap(e.detail));
  document.addEventListener('level-selected', (e) => {
    const levelId = e.detail?.levelId;
    if (!levelId || !levelFlow.isUnlocked(levelId)) return;
    startLevel(getLevel(levelId));
  });
  document.addEventListener('modal-action', (e) => handleModalAction(e.detail?.action));

  // HUD control events
  document.addEventListener('hud-exit',  () => showLevelSelect());
  document.addEventListener('hud-retry', () => activeLevelDef && startLevel(activeLevelDef));
  document.addEventListener('hud-pause', () => {
    toastView.show('Paused');
  });

  // Browser back button support
  initRouter((screenName) => {
    if (screenName === 'game' && activeLevelDef) {
      boardView.render(gameController.getBoardState());
      hudView.update(hudSnapshot(gameController.getBoardState(), activeLevelDef));
    }
    if (screenName === 'level-select') {
      showLevelSelect();
    }
  });

  showLevelSelect();

  if (levelFlow.canResume()) {
    modalContext = { type: 'resume' };
    const resume = levelFlow.progress.resumeSession;
    modalView.show({
      title: 'Continue game?',
      message: `Resume Level ${resume.levelId} from your last session.`,
      actions: [
        { id: 'resume-yes', label: 'Continue', primary: true },
        { id: 'resume-no', label: 'Start Fresh' },
      ],
    });
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
