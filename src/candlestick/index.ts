/**
 * Candlestick pattern detectors.
 *
 * Three import surfaces:
 *
 *   1. Individual patterns:
 *        `import { Doji, BullishEngulfingPattern } from '@debut/indicators'`
 *
 *   2. Namespaced (avoid pulling 30+ symbols into scope):
 *        `import { Candlestick } from '@debut/indicators';
 *         new Candlestick.Doji()`
 *
 *   3. Combined scanners that report which patterns fired on
 *      the current bar:
 *        `import { AllCandlestickPatterns,
 *                  BullishPatterns,
 *                  BearishPatterns } from '@debut/indicators'`
 */
export * from './patterns';
export {
    AllCandlestickPatterns,
    BullishPatterns,
    BearishPatterns,
} from './all-patterns';
export type { CandlestickPatternName } from './all-patterns';
