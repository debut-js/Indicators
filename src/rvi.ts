import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Relative Vigor Index (RVI)
 *
 *   swma(v) = (v[i-3] + 2*v[i-2] + 2*v[i-1] + v[i]) / 6
 *   sumCO   = sum(swma(close - open), length)
 *   sumHL   = sum(swma(high - low),   length)
 *   RVI     = sumCO / sumHL                      (0 if denom == 0)
 *   signal  = swma(RVI)
 *
 * Default length = 10. The series emits from bar `length + 2` onwards
 * (3 bars of SWMA warmup plus `length - 1` to fill the rolling sums),
 * matching the oakscriptjs reference exactly.
 */
export class RVI  implements StatefulIndicator<GenericIndicatorState> {
    private coSwmaBuf = new CircularBuffer(4);
    private hlSwmaBuf = new CircularBuffer(4);
    private coWindow: CircularBuffer;
    private hlWindow: CircularBuffer;
    private rviSwmaBuf = new CircularBuffer(4);
    private sumCO = 0;
    private sumHL = 0;

    constructor(private period = 10) {
        this.coWindow = new CircularBuffer(period);
        this.hlWindow = new CircularBuffer(period);
    }

    nextValue(open: number, high: number, low: number, close: number) {
        this.coSwmaBuf.push(close - open);
        this.hlSwmaBuf.push(high - low);
        if (!this.coSwmaBuf.filled) return;

        const swmaCO = this.swma(this.coSwmaBuf);
        const swmaHL = this.swma(this.hlSwmaBuf);

        const wasFilled = this.coWindow.filled;
        const oldCO = this.coWindow.push(swmaCO);
        const oldHL = this.hlWindow.push(swmaHL);
        if (wasFilled) {
            this.sumCO += swmaCO - oldCO;
            this.sumHL += swmaHL - oldHL;
        } else {
            this.sumCO += swmaCO;
            this.sumHL += swmaHL;
        }

        if (!this.coWindow.filled) return;
        const rvi = this.sumHL === 0 ? 0 : this.sumCO / this.sumHL;
        this.rviSwmaBuf.push(rvi);
        const signal = this.rviSwmaBuf.filled ? this.swma(this.rviSwmaBuf) : undefined;
        return { rvi, signal };
    }

    momentValue(open: number, high: number, low: number, close: number) {
        // Compute the would-be SWMA outputs without mutating the
        // small 4-slot warmup buffers.
        const co = close - open;
        const hl = high - low;
        if (this.coSwmaBuf.loaded < 3) return;

        const swmaCO = this.peekSwma(this.coSwmaBuf, co);
        const swmaHL = this.peekSwma(this.hlSwmaBuf, hl);

        let sumCO: number;
        let sumHL: number;
        if (this.coWindow.filled) {
            sumCO = this.sumCO - this.coWindow.peek() + swmaCO;
            sumHL = this.sumHL - this.hlWindow.peek() + swmaHL;
        } else if (this.coWindow.loaded === this.period - 1) {
            sumCO = this.sumCO + swmaCO;
            sumHL = this.sumHL + swmaHL;
        } else {
            return;
        }

        const rvi = sumHL === 0 ? 0 : sumCO / sumHL;
        const signal = this.rviSwmaBuf.loaded >= 3 ? this.peekSwma(this.rviSwmaBuf, rvi) : undefined;
        return { rvi, signal };
    }

    private swma(buf: CircularBuffer) {
        return ((buf.at(0) as number) + 2 * (buf.at(1) as number) + 2 * (buf.at(2) as number) + (buf.at(3) as number)) / 6;
    }

    /** SWMA over the hypothetical post-push state of `buf`. */
    private peekSwma(buf: CircularBuffer, appended: number) {
        const startOffset = buf.filled ? 1 : 0;
        const v0 = buf.at(0 + startOffset) as number;
        const v1 = buf.at(1 + startOffset) as number;
        const v2 = buf.at(2 + startOffset) as number;
        return (v0 + 2 * v1 + 2 * v2 + appended) / 6;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
