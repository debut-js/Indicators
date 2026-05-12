import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Vortex Indicator (VI+ / VI-)
 *
 *   VM+ = |high - prevLow|
 *   VM- = |low  - prevHigh|
 *   TR  = max(high - low, |high - prevClose|, |low - prevClose|)
 *   VI+ = sum(VM+, length) / sum(TR, length)
 *   VI- = sum(VM-, length) / sum(TR, length)
 *
 * The first bar has no "previous" context so contributes nothing; the
 * indicator is ready after `length + 1` bars (one to seed prev OHLC,
 * `length` to fill the rolling sums).
 */
export class Vortex  implements StatefulIndicator<GenericIndicatorState> {
    private prevHigh: number | undefined;
    private prevLow: number | undefined;
    private prevClose: number | undefined;
    private vmPlusBuf: CircularBuffer;
    private vmMinusBuf: CircularBuffer;
    private trBuf: CircularBuffer;
    private sumVMPlus = 0;
    private sumVMMinus = 0;
    private sumTR = 0;

    constructor(private period = 14) {
        this.vmPlusBuf = new CircularBuffer(period);
        this.vmMinusBuf = new CircularBuffer(period);
        this.trBuf = new CircularBuffer(period);
    }

    nextValue(high: number, low: number, close: number) {
        if (this.prevClose === undefined) {
            this.prevHigh = high;
            this.prevLow = low;
            this.prevClose = close;
            return;
        }

        const vmPlus = Math.abs(high - (this.prevLow as number));
        const vmMinus = Math.abs(low - (this.prevHigh as number));
        const tr = Math.max(
            high - low,
            Math.abs(high - this.prevClose),
            Math.abs(low - this.prevClose),
        );

        const wasFilled = this.vmPlusBuf.filled;
        const oldVMP = this.vmPlusBuf.push(vmPlus);
        const oldVMM = this.vmMinusBuf.push(vmMinus);
        const oldTR = this.trBuf.push(tr);

        if (wasFilled) {
            this.sumVMPlus += vmPlus - oldVMP;
            this.sumVMMinus += vmMinus - oldVMM;
            this.sumTR += tr - oldTR;
        } else {
            this.sumVMPlus += vmPlus;
            this.sumVMMinus += vmMinus;
            this.sumTR += tr;
        }

        this.prevHigh = high;
        this.prevLow = low;
        this.prevClose = close;

        if (!this.vmPlusBuf.filled) return;
        if (this.sumTR === 0) return;
        return {
            plus: this.sumVMPlus / this.sumTR,
            minus: this.sumVMMinus / this.sumTR,
        };
    }

    momentValue(high: number, low: number, close: number) {
        if (this.prevClose === undefined) return;

        const vmPlus = Math.abs(high - (this.prevLow as number));
        const vmMinus = Math.abs(low - (this.prevHigh as number));
        const tr = Math.max(
            high - low,
            Math.abs(high - this.prevClose),
            Math.abs(low - this.prevClose),
        );

        if (!this.vmPlusBuf.filled) {
            if (this.vmPlusBuf.loaded !== this.period - 1) return;
            const sumP = this.sumVMPlus + vmPlus;
            const sumM = this.sumVMMinus + vmMinus;
            const sumT = this.sumTR + tr;
            if (sumT === 0) return;
            return { plus: sumP / sumT, minus: sumM / sumT };
        }

        const oldVMP = this.vmPlusBuf.peek();
        const oldVMM = this.vmMinusBuf.peek();
        const oldTR = this.trBuf.peek();
        const sumP = this.sumVMPlus - oldVMP + vmPlus;
        const sumM = this.sumVMMinus - oldVMM + vmMinus;
        const sumT = this.sumTR - oldTR + tr;
        if (sumT === 0) return;
        return { plus: sumP / sumT, minus: sumM / sumT };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
