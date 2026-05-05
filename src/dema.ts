import { EMA } from './ema';

/**
 * Double Exponential Moving Average (DEMA)
 *
 * Reduces lag by combining a single EMA with a double-smoothed EMA.
 * Formula: DEMA = 2 * EMA(price, n) - EMA(EMA(price, n), n)
 */
export class DEMA {
    private ema1: EMA;
    private ema2: EMA;

    constructor(private period = 9) {
        this.ema1 = new EMA(period);
        this.ema2 = new EMA(period);
    }

    nextValue(value: number) {
        const e1 = this.ema1.nextValue(value);

        if (e1 === undefined) {
            return;
        }

        const e2 = this.ema2.nextValue(e1);

        if (e2 === undefined) {
            return;
        }

        return 2 * e1 - e2;
    }

    momentValue(value: number) {
        const e1 = this.ema1.momentValue(value);

        if (e1 === undefined) {
            return;
        }

        const e2 = this.ema2.momentValue(e1);

        if (e2 === undefined) {
            return;
        }

        return 2 * e1 - e2;
    }
}
