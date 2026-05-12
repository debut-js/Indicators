import { SMA } from './sma';
import { EMA } from './ema';
import { StandardDeviation } from './providers/standard-deviation';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Relative Volatility Index (RVOL)
 *
 *   stdev      = stdev(close, length)
 *   chg        = close - prevClose
 *   upperInput = chg <= 0 ? 0 : stdev
 *   lowerInput = chg >  0 ? 0 : stdev
 *   upper      = EMA(upperInput, 14)
 *   lower      = EMA(lowerInput, 14)
 *   RVOL       = upper / (upper + lower) * 100
 *
 * The 14-period smoothing length is hardcoded to match the original
 * Pine reference (and the LWC port). Default `length` for the stdev
 * window is 10. The first bar has no `chg`, so EMA seeding effectively
 * begins from bar 1; combined with stdev's `length-1` warmup, RVOL
 * emits from bar `length + 12` onwards.
 */
export class RelativeVolatilityIndex  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private sma: SMA;
    private stdev: StandardDeviation;
    private upperEma: EMA;
    private lowerEma: EMA;

    constructor(private period = 10) {
        this.sma = new SMA(period);
        this.stdev = new StandardDeviation(period);
        this.upperEma = new EMA(14);
        this.lowerEma = new EMA(14);
    }

    nextValue(close: number) {
        const mean = this.sma.nextValue(close);
        const sd = this.stdev.nextValue(close, mean);

        if (this.prevClose === undefined) {
            this.prevClose = close;
            return;
        }
        const chg = close - this.prevClose;
        this.prevClose = close;

        // Mirror the oakscriptjs reference exactly: even before stdev
        // has warmed up, the conditional branch that lands on `0` is
        // a perfectly valid EMA input and contributes to seeding.
        // Only the `chg > 0 + stdev not ready` (and symmetric for the
        // lower side) lands on a NaN value, which we drop just like
        // oakscriptjs's EMA skips NaN samples.
        const upperInput = chg <= 0 ? 0 : sd;
        const lowerInput = chg > 0 ? 0 : sd;

        const upper = isNaN(upperInput) ? undefined : this.upperEma.nextValue(upperInput);
        const lower = isNaN(lowerInput) ? undefined : this.lowerEma.nextValue(lowerInput);
        if (upper === undefined || lower === undefined) return;

        const denom = upper + lower;
        return denom === 0 ? 0 : (upper / denom) * 100;
    }

    momentValue(close: number) {
        if (this.prevClose === undefined) return;
        const mean = this.sma.momentValue(close);
        const sd = this.stdev.momentValue(close, mean);

        const chg = close - this.prevClose;
        const upperInput = chg <= 0 ? 0 : sd;
        const lowerInput = chg > 0 ? 0 : sd;
        const upper = isNaN(upperInput) ? undefined : this.upperEma.momentValue(upperInput);
        const lower = isNaN(lowerInput) ? undefined : this.lowerEma.momentValue(lowerInput);
        if (upper === undefined || lower === undefined) return;
        const denom = upper + lower;
        return denom === 0 ? 0 : (upper / denom) * 100;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
