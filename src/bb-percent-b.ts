import { BollingerBands } from './bands';

/**
 * Bollinger Bands %B
 *
 *   %B = (price - lower) / (upper - lower)
 *
 * Above 1 = price above the upper band, below 0 = price below the lower band.
 * Returns `undefined` while the underlying BB is warming up, or when the
 * upper and lower bands are equal (degenerate window).
 */
export class BBPercentB {
    private bb: BollingerBands;

    constructor(period = 20, stdDev = 2) {
        this.bb = new BollingerBands(period, stdDev);
    }

    nextValue(price: number) {
        const bb = this.bb.nextValue(price);
        if (!bb) return;

        const range = bb.upper - bb.lower;
        if (range === 0) return;
        return (price - bb.lower) / range;
    }

    momentValue(price: number) {
        const bb = this.bb.momentValue(price);
        if (!bb) return;

        const range = bb.upper - bb.lower;
        if (range === 0) return;
        return (price - bb.lower) / range;
    }
}
