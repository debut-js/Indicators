import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Choppiness Index
 *
 *   TR     = max(high - low, |high - prevClose|, |low - prevClose|)   // bar 0: high - low
 *   CI     = 100 * log10(sum(TR, length) / (highest(high, length) - lowest(low, length))) / log10(length)
 *
 * Reads from rolling buffers of TR / high / low (size = `length`).
 * Emits from bar `length-1` onwards.
 *
 * Note: oakscriptjs computes ATR(1) which equals TR exactly (RMA with
 * α=1/1 collapses to the latest input), so this port uses TR directly.
 */
export class Choppiness  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private trBuf: CircularBuffer;
    private highBuf: CircularBuffer;
    private lowBuf: CircularBuffer;
    private sumTR = 0;
    private logLength: number;

    constructor(private period = 14) {
        this.trBuf = new CircularBuffer(period);
        this.highBuf = new CircularBuffer(period);
        this.lowBuf = new CircularBuffer(period);
        this.logLength = Math.log10(period);
    }

    nextValue(high: number, low: number, close: number) {
        const tr =
            this.prevClose === undefined
                ? high - low
                : Math.max(high - low, Math.abs(high - this.prevClose), Math.abs(low - this.prevClose));
        this.prevClose = close;

        const wasFilled = this.trBuf.filled;
        const oldTR = this.trBuf.push(tr);
        this.highBuf.push(high);
        this.lowBuf.push(low);

        if (wasFilled) {
            this.sumTR += tr - oldTR;
        } else {
            this.sumTR += tr;
        }

        if (!this.trBuf.filled) return;
        return this.compute(this.sumTR, this.highBuf, this.lowBuf);
    }

    momentValue(high: number, low: number, close: number) {
        const tr =
            this.prevClose === undefined
                ? high - low
                : Math.max(high - low, Math.abs(high - this.prevClose), Math.abs(low - this.prevClose));

        let sumTR: number;
        let highHi: number;
        let lowLo: number;

        if (this.trBuf.filled) {
            sumTR = this.sumTR - this.trBuf.peek() + tr;
            highHi = high;
            lowLo = low;
            for (let i = 1; i < this.period; i++) {
                const h = this.highBuf.at(i) as number;
                const l = this.lowBuf.at(i) as number;
                if (h > highHi) highHi = h;
                if (l < lowLo) lowLo = l;
            }
        } else if (this.trBuf.loaded === this.period - 1) {
            sumTR = this.sumTR + tr;
            highHi = high;
            lowLo = low;
            for (let i = 0; i < this.period - 1; i++) {
                const h = this.highBuf.at(i) as number;
                const l = this.lowBuf.at(i) as number;
                if (h > highHi) highHi = h;
                if (l < lowLo) lowLo = l;
            }
        } else {
            return;
        }

        const range = highHi - lowLo;
        if (range === 0) return;
        return (100 * Math.log10(sumTR / range)) / this.logLength;
    }

    private compute(sumTR: number, highBuf: CircularBuffer, lowBuf: CircularBuffer) {
        let highHi = -Infinity;
        let lowLo = Infinity;
        highBuf.forEach((h) => {
            if (h > highHi) highHi = h;
        });
        lowBuf.forEach((l) => {
            if (l < lowLo) lowLo = l;
        });
        const range = highHi - lowLo;
        if (range === 0) return;
        return (100 * Math.log10(sumTR / range)) / this.logLength;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
