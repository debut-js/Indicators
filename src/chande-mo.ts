import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Chande Momentum Oscillator (CMO)
 *
 * Variant from the LWC "chande-mo" reference. Uses raw price changes
 * (not Wilder smoothing).
 *
 *   m  = close - prevClose
 *   m1 = max(m, 0), m2 = max(-m, 0)
 *   sm1 = sum(m1, length), sm2 = sum(m2, length)
 *   ChandeMO = 100 * (sm1 - sm2) / (sm1 + sm2)
 *
 * The first bar has no `prevClose`, so it's effectively skipped; the
 * indicator emits from bar `length` onwards (one extra bar of warmup
 * to seed the change series, matching the oakscriptjs reference).
 */
export class ChandeMO  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private posBuf: CircularBuffer;
    private negBuf: CircularBuffer;
    private sumPos = 0;
    private sumNeg = 0;

    constructor(private period = 9) {
        this.posBuf = new CircularBuffer(period);
        this.negBuf = new CircularBuffer(period);
    }

    nextValue(close: number) {
        if (this.prevClose === undefined) {
            this.prevClose = close;
            return;
        }
        const m = close - this.prevClose;
        this.prevClose = close;
        const pos = m >= 0 ? m : 0;
        const neg = m >= 0 ? 0 : -m;

        const wasFilled = this.posBuf.filled;
        const oldPos = this.posBuf.push(pos);
        const oldNeg = this.negBuf.push(neg);

        if (wasFilled) {
            this.sumPos += pos - oldPos;
            this.sumNeg += neg - oldNeg;
        } else {
            this.sumPos += pos;
            this.sumNeg += neg;
        }

        if (!this.posBuf.filled) return;
        const total = this.sumPos + this.sumNeg;
        if (total === 0) return 0;
        return (100 * (this.sumPos - this.sumNeg)) / total;
    }

    momentValue(close: number) {
        if (this.prevClose === undefined) return;
        const m = close - this.prevClose;
        const pos = m >= 0 ? m : 0;
        const neg = m >= 0 ? 0 : -m;

        let sumPos: number;
        let sumNeg: number;
        if (this.posBuf.filled) {
            sumPos = this.sumPos - this.posBuf.peek() + pos;
            sumNeg = this.sumNeg - this.negBuf.peek() + neg;
        } else if (this.posBuf.loaded === this.period - 1) {
            sumPos = this.sumPos + pos;
            sumNeg = this.sumNeg + neg;
        } else {
            return;
        }

        const total = sumPos + sumNeg;
        if (total === 0) return 0;
        return (100 * (sumPos - sumNeg)) / total;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
