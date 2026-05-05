import { EMA } from './ema';

/**
 * Bull-Bear Power (Elder)
 *
 *   bullPower = high - EMA(close, length)
 *   bearPower = low  - EMA(close, length)
 *   BBP       = bullPower + bearPower = high + low - 2 * EMA(close, length)
 *
 * Returns `undefined` until the EMA has warmed up.
 */
export class BullBearPower {
    private ema: EMA;

    constructor(period = 13) {
        this.ema = new EMA(period);
    }

    nextValue(high: number, low: number, close: number) {
        const e = this.ema.nextValue(close);
        if (e === undefined) return;
        return high + low - 2 * e;
    }

    momentValue(high: number, low: number, close: number) {
        const e = this.ema.momentValue(close);
        if (e === undefined) return;
        return high + low - 2 * e;
    }
}
