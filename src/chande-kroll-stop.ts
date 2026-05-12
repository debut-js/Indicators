import { RMA } from './rma';
import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Chande Kroll Stop
 *
 *   atr        = ATR(atrLength)              (RMA-smoothed)
 *   firstHigh  = highest(high, atrLength) - atrCoeff * atr
 *   firstLow   = lowest(low,   atrLength) + atrCoeff * atr
 *   stopShort  = highest(firstHigh, stopLength)
 *   stopLong   = lowest(firstLow,   stopLength)
 *
 * Defaults follow LWC: atrLength=10, atrCoeff=1, stopLength=9.
 */
export class ChandeKrollStop  implements StatefulIndicator<GenericIndicatorState> {
    private atrRma: RMA;
    private prevClose: number | undefined;
    private highBuf: CircularBuffer;
    private lowBuf: CircularBuffer;
    private firstHighBuf: CircularBuffer;
    private firstLowBuf: CircularBuffer;

    constructor(
        private atrLength = 10,
        private atrCoeff = 1,
        private stopLength = 9,
    ) {
        // Inline TR + RMA so we match oakscriptjs's `ta.atr` exactly:
        // oakscriptjs emits TR = high - low for bar 0 (no prev close),
        // while debut's wrapper `ATR` skips that bar — they would
        // disagree on RMA seeding by one bar.
        this.atrRma = new RMA(atrLength);
        this.highBuf = new CircularBuffer(atrLength);
        this.lowBuf = new CircularBuffer(atrLength);
        this.firstHighBuf = new CircularBuffer(stopLength);
        this.firstLowBuf = new CircularBuffer(stopLength);
    }

    nextValue(high: number, low: number, close: number) {
        const tr =
            this.prevClose === undefined
                ? high - low
                : Math.max(
                      high - low,
                      Math.abs(high - this.prevClose),
                      Math.abs(low - this.prevClose),
                  );
        this.prevClose = close;
        const atrVal = this.atrRma.nextValue(tr);
        this.highBuf.push(high);
        this.lowBuf.push(low);

        if (!this.highBuf.filled || atrVal === undefined) return;

        let hh = -Infinity;
        let ll = Infinity;
        this.highBuf.forEach((h) => {
            if (h > hh) hh = h;
        });
        this.lowBuf.forEach((l) => {
            if (l < ll) ll = l;
        });

        const firstHigh = hh - this.atrCoeff * atrVal;
        const firstLow = ll + this.atrCoeff * atrVal;
        this.firstHighBuf.push(firstHigh);
        this.firstLowBuf.push(firstLow);

        if (!this.firstHighBuf.filled) return;

        let stopShort = -Infinity;
        let stopLong = Infinity;
        this.firstHighBuf.forEach((v) => {
            if (v > stopShort) stopShort = v;
        });
        this.firstLowBuf.forEach((v) => {
            if (v < stopLong) stopLong = v;
        });

        return { stopLong, stopShort };
    }

    momentValue(high: number, low: number, _close: number) {
        const tr =
            this.prevClose === undefined
                ? high - low
                : Math.max(
                      high - low,
                      Math.abs(high - this.prevClose),
                      Math.abs(low - this.prevClose),
                  );
        const atrVal = this.atrRma.momentValue(tr);
        if (atrVal === undefined) return;

        const filledHL = this.highBuf.filled;
        if (!filledHL && this.highBuf.loaded !== this.atrLength - 1) return;

        let hh = high;
        let ll = low;
        const startHL = filledHL ? 1 : 0;
        const realHL = this.highBuf.loaded - startHL;
        for (let i = 0; i < realHL; i++) {
            const h = this.highBuf.at(i + startHL) as number;
            const l = this.lowBuf.at(i + startHL) as number;
            if (h > hh) hh = h;
            if (l < ll) ll = l;
        }

        const firstHigh = hh - this.atrCoeff * atrVal;
        const firstLow = ll + this.atrCoeff * atrVal;

        const filledStop = this.firstHighBuf.filled;
        if (!filledStop && this.firstHighBuf.loaded !== this.stopLength - 1) return;

        let stopShort = firstHigh;
        let stopLong = firstLow;
        const startStop = filledStop ? 1 : 0;
        const realStop = this.firstHighBuf.loaded - startStop;
        for (let i = 0; i < realStop; i++) {
            const fh = this.firstHighBuf.at(i + startStop) as number;
            const fl = this.firstLowBuf.at(i + startStop) as number;
            if (fh > stopShort) stopShort = fh;
            if (fl < stopLong) stopLong = fl;
        }

        return { stopLong, stopShort };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
