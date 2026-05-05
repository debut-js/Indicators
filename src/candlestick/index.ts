/**
 * Candlestick pattern detectors.
 *
 * Each pattern is fully self-contained — no shared base class, no
 * shared context. Pick what you need:
 *
 *   - import individual patterns: `import { Doji, Hammer } from '@debut/indicators'`
 *   - import everything via namespace: `import { Candlestick } from '@debut/indicators'`
 *   - scan all 44 at once: `import { AllCandlestickPatterns } from '@debut/indicators'`
 */
export * from './patterns';
export { AllCandlestickPatterns } from './all-patterns';
export type { CandlestickPatternName } from './all-patterns';
