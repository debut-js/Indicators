import { WMA } from './wma';

/**
 * Hull Moving Average (HMA)
 *
 * Reduces lag of a traditional moving average while maintaining smoothness.
 * Formula: HMA = WMA(2 * WMA(price, n/2) - WMA(price, n), sqrt(n))
 *
 * Streaming-friendly: chains three WMAs.
 */
export class HMA {
    private halfWma: WMA;
    private fullWma: WMA;
    private outerWma: WMA;

    constructor(private period = 9) {
        const halfLength = Math.max(1, Math.floor(period / 2));
        const sqrtLength = Math.max(1, Math.floor(Math.sqrt(period)));
        this.halfWma = new WMA(halfLength);
        this.fullWma = new WMA(period);
        this.outerWma = new WMA(sqrtLength);
    }

    nextValue(value: number) {
        const w1 = this.halfWma.nextValue(value);
        const w2 = this.fullWma.nextValue(value);

        if (w1 === undefined || w2 === undefined) {
            return;
        }

        return this.outerWma.nextValue(2 * w1 - w2);
    }

    momentValue(value: number) {
        const w1 = this.halfWma.momentValue(value);
        const w2 = this.fullWma.momentValue(value);

        if (w1 === undefined || w2 === undefined) {
            return;
        }

        return this.outerWma.momentValue(2 * w1 - w2);
    }
}
