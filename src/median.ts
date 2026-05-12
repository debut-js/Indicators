import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Rolling Median (50th-percentile, nearest-rank)
 *
 *   median = sort(hl2 over length)[ ceil(0.5 * length) - 1 ]
 *
 * Matches the LWC `Median` indicator's primary plot. The companion
 * ATR-based bands and EMA in the LWC reference are intentionally
 * out-of-scope for this minimal port — they can be reconstructed by
 * pairing this with the existing `ATR` and `EMA` classes.
 */
export class Median  implements StatefulIndicator<GenericIndicatorState> {
    private buffer: CircularBuffer;
    private medianIdx: number;

    constructor(private period = 3) {
        this.buffer = new CircularBuffer(period);
        this.medianIdx = Math.max(0, Math.ceil(0.5 * period) - 1);
    }

    nextValue(high: number, low: number) {
        const hl2 = (high + low) / 2;
        this.buffer.push(hl2);
        if (!this.buffer.filled) return;
        return this.computeMedian();
    }

    momentValue(high: number, low: number) {
        const hl2 = (high + low) / 2;
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period - 1) return;
            return this.computeMedianHypothetical(hl2, 0);
        }
        return this.computeMedianHypothetical(hl2, 1);
    }

    private computeMedian() {
        const sorted = new Array<number>(this.period);
        this.buffer.forEach((v, idx) => {
            sorted[idx as number] = v;
        });
        sorted.sort((a, b) => a - b);
        return sorted[this.medianIdx];
    }

    private computeMedianHypothetical(append: number, startOffset: number) {
        const sorted = new Array<number>(this.period);
        const real = this.period - 1;
        for (let i = 0; i < real; i++) {
            sorted[i] = this.buffer.at(i + startOffset) as number;
        }
        sorted[real] = append;
        sorted.sort((a, b) => a - b);
        return sorted[this.medianIdx];
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
