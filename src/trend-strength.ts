import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Trend Strength Index
 *
 *   r = Pearson correlation between close and bar-index over `length` bars
 *
 * Identical to `ta.correlation(close, barIndex, length)` from oakscriptjs.
 * Since the bar index series is just consecutive integers, its mean and
 * variance over any window of length L are constants — we can subtract
 * the index mean once and only track price-side moments.
 *
 * Returns values in [-1, 1]; values near +1 mean a strong uptrend,
 * near -1 a strong downtrend. Returns `undefined` when the window has
 * a zero-variance price series (degenerate denominator).
 */
export class TrendStrengthIndex  implements StatefulIndicator<GenericIndicatorState> {
    private buffer: CircularBuffer;
    private xMean: number;
    private xDevSqSum: number; // sum of (x - xMean)^2 for x = 0..length-1, constant

    constructor(private period = 14) {
        this.buffer = new CircularBuffer(period);
        this.xMean = (period - 1) / 2;
        let sx2 = 0;
        for (let i = 0; i < period; i++) {
            const dev = i - this.xMean;
            sx2 += dev * dev;
        }
        this.xDevSqSum = sx2;
    }

    nextValue(value: number) {
        this.buffer.push(value);
        if (!this.buffer.filled) return;
        return this.compute(0, undefined);
    }

    momentValue(value: number) {
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period - 1) return;
            return this.compute(0, value);
        }
        return this.compute(1, value);
    }

    /**
     * @param startOffset 0 to walk the real buffer, 1 to skip the
     *        would-be-evicted slot for a hypothetical scan.
     * @param appendValue if defined, treated as the newest entry at
     *        x = period - 1.
     */
    private compute(startOffset: number, appendValue: number | undefined) {
        // First pass: mean of y over the window.
        let sumY = appendValue ?? 0;
        const realCount = appendValue === undefined ? this.period : this.period - 1;
        for (let i = 0; i < realCount; i++) {
            sumY += this.buffer.at(i + startOffset) as number;
        }
        const yMean = sumY / this.period;

        // Second pass: (x - xMean)(y - yMean), (y - yMean)^2.
        let cov = 0;
        let yDevSq = 0;
        for (let i = 0; i < realCount; i++) {
            const y = this.buffer.at(i + startOffset) as number;
            const dy = y - yMean;
            const dx = i - this.xMean;
            cov += dx * dy;
            yDevSq += dy * dy;
        }
        if (appendValue !== undefined) {
            const dy = appendValue - yMean;
            const dx = this.period - 1 - this.xMean;
            cov += dx * dy;
            yDevSq += dy * dy;
        }

        const denom = Math.sqrt(this.xDevSqSum * yDevSq);
        if (denom === 0) return;
        return cov / denom;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
