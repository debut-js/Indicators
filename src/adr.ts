import { SMA } from './sma';

/**
 * Average Daily Range (ADR)
 *
 *   ADR = SMA(high - low, length)
 *
 * A simple volatility proxy — the average bar range over `length`
 * periods. Useful for sizing stops or as an ATR alternative when you
 * want strictly arithmetic averaging.
 */
export class ADR {
    private sma: SMA;

    constructor(period = 14) {
        this.sma = new SMA(period);
    }

    nextValue(high: number, low: number) {
        return this.sma.nextValue(high - low);
    }

    momentValue(high: number, low: number) {
        return this.sma.momentValue(high - low);
    }
}
