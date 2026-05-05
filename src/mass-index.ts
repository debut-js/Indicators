import { EMA } from './ema';
import { CircularBuffer } from './providers/circular-buffer';

/**
 * Mass Index
 *
 *   range = high - low
 *   ratio = EMA(range, 9) / EMA(EMA(range, 9), 9)
 *   MassIndex = sum(ratio, length)
 *
 * The single-EMA period is fixed at 9 by convention; only the outer
 * summation `length` is configurable. Returns `undefined` until the
 * inner double-EMA has produced `length` consecutive ratios.
 */
export class MassIndex {
    private inner: EMA;
    private outer: EMA;
    private window: CircularBuffer;

    constructor(private period = 10) {
        this.inner = new EMA(9);
        this.outer = new EMA(9);
        this.window = new CircularBuffer(period);
    }

    nextValue(high: number, low: number) {
        const range = high - low;
        const e1 = this.inner.nextValue(range);
        if (e1 === undefined) return;

        const e2 = this.outer.nextValue(e1);
        if (e2 === undefined || e2 === 0) return;

        const ratio = e1 / e2;
        this.window.push(ratio);

        if (!this.window.filled) return;

        let sum = 0;
        this.window.forEach((v) => {
            sum += v;
        });
        return sum;
    }

    momentValue(high: number, low: number) {
        const range = high - low;
        const e1 = this.inner.momentValue(range);
        if (e1 === undefined) return;

        const e2 = this.outer.momentValue(e1);
        if (e2 === undefined || e2 === 0) return;

        const ratio = e1 / e2;

        if (!this.window.filled) {
            if (this.window.loaded !== this.period - 1) return;
            // Hypothetical push fills the buffer with no eviction:
            // sum of new window == sum of existing values + ratio.
            let sum = 0;
            for (let i = 0; i < this.period - 1; i++) {
                sum += this.window.at(i) as number;
            }
            return sum + ratio;
        }

        // Buffer is full: drop the oldest, add the hypothetical ratio.
        let sum = 0;
        for (let i = 1; i < this.period; i++) {
            sum += this.window.at(i) as number;
        }
        return sum + ratio;
    }
}
