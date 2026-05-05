import { CircularBuffer } from './providers/circular-buffer';

/**
 * Least Squares Moving Average (LSMA) — also known as a "Linear
 * Regression Line". Fits a least-squares line through the last
 * `period` source values and reports the line's value at offset
 * `offset` from the most recent point. Offset 0 (the default) yields
 * the regression endpoint, matching `ta.linreg(src, length, 0)`.
 *
 * Streaming with O(period) per `nextValue` (we need to walk the buffer
 * to compute the regression sums). The x-axis sums are constant for a
 * fixed window length so they're memoised.
 */
export class LSMA {
    private buffer: CircularBuffer;
    private sumX: number;
    private sumX2: number;

    constructor(private period = 25, private offset = 0) {
        this.buffer = new CircularBuffer(period);
        // Within any window we treat x = 0..period-1; these sums depend
        // only on the period and so are computed once.
        this.sumX = (period * (period - 1)) / 2;
        let sx2 = 0;
        for (let i = 0; i < period; i++) sx2 += i * i;
        this.sumX2 = sx2;
    }

    nextValue(value: number) {
        this.buffer.push(value);
        if (!this.buffer.filled) return;
        return this.regress();
    }

    momentValue(value: number) {
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period - 1) return;
            return this.regressHypothetical(value, 0);
        }
        return this.regressHypothetical(value, 1);
    }

    private regress() {
        let sumY = 0;
        let sumXY = 0;
        // forEach iterates oldest→newest only when the buffer is filled,
        // which is the only branch that calls regress(). idx is the
        // x-coordinate within the regression window.
        this.buffer.forEach((y, idx) => {
            const i = idx as number;
            sumY += y;
            sumXY += i * y;
        });

        const n = this.period;
        const slope = (n * sumXY - this.sumX * sumY) / (n * this.sumX2 - this.sumX * this.sumX);
        const intercept = (sumY - slope * this.sumX) / n;
        const x = n - 1 - this.offset;
        return intercept + slope * x;
    }

    private regressHypothetical(value: number, startOffset: number) {
        const n = this.period;
        const realCount = n - 1; // we always borrow `value` for the newest slot
        let sumY = value;
        let sumXY = (n - 1) * value;
        for (let i = 0; i < realCount; i++) {
            const y = this.buffer.at(i + startOffset) as number;
            sumY += y;
            sumXY += i * y;
        }
        const slope = (n * sumXY - this.sumX * sumY) / (n * this.sumX2 - this.sumX * this.sumX);
        const intercept = (sumY - slope * this.sumX) / n;
        const x = n - 1 - this.offset;
        return intercept + slope * x;
    }
}
