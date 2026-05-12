import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Aroon Indicator
 *
 * Measures how recently the highest high / lowest low occurred within a
 * lookback window of `length + 1` bars (the bar at index 0 plus `length`
 * preceding bars in oakscriptjs's reference).
 *
 *   AroonUp   = 100 * (length - barsSinceHighest) / length
 *   AroonDown = 100 * (length - barsSinceLowest)  / length
 *
 * Returns `undefined` until the window is fully primed (i.e. `length + 1`
 * bars have been observed).
 */
export class Aroon  implements StatefulIndicator<GenericIndicatorState> {
    private highs: CircularBuffer;
    private lows: CircularBuffer;
    private windowSize: number;

    constructor(private period = 14) {
        this.windowSize = period + 1;
        this.highs = new CircularBuffer(this.windowSize);
        this.lows = new CircularBuffer(this.windowSize);
    }

    nextValue(high: number, low: number) {
        this.highs.push(high);
        this.lows.push(low);

        if (!this.highs.filled) {
            return;
        }

        return this.compute();
    }

    momentValue(high: number, low: number) {
        // Hypothetical post-push window without mutating state.
        if (!this.highs.filled) {
            if (this.highs.loaded !== this.windowSize - 1) {
                return;
            }
            // Push fills the buffer with no eviction: existing values
            // keep their oldest→newest positions at indices 0..size-2,
            // hypothetical value lands at size-1.
            return this.scanWindow(0, high, low);
        }

        // Buffer is full: hypothetical push evicts at(0); remaining
        // entries shift to indices 0..size-2, hypothetical value at size-1.
        return this.scanWindow(1, high, low);
    }

    private compute() {
        return this.scanWindow(0);
    }

    /**
     * Scan the active window for highest high / lowest low.
     *
     * `startOffset` selects where in the existing buffer the window
     * begins (0 for the real buffer state, 1 to skip the would-be
     * evicted entry). When `appendHigh` / `appendLow` are provided
     * they are treated as the newest value at index `windowSize - 1`,
     * which is the position the buffer would hold after the
     * hypothetical push. This lets `momentValue` reuse the same scan
     * without ever mutating buffer state.
     */
    private scanWindow(startOffset: number, appendHigh?: number, appendLow?: number) {
        const newest = this.windowSize - 1;
        const realCount = appendHigh === undefined ? this.windowSize : newest;

        let highestVal = -Infinity;
        let lowestVal = Infinity;
        let highestIdx = 0;
        let lowestIdx = 0;

        for (let i = 0; i < realCount; i++) {
            const h = this.highs.at(i + startOffset) as number;
            const l = this.lows.at(i + startOffset) as number;
            if (h > highestVal) {
                highestVal = h;
                highestIdx = i;
            }
            if (l < lowestVal) {
                lowestVal = l;
                lowestIdx = i;
            }
        }

        if (appendHigh !== undefined && appendHigh > highestVal) {
            highestIdx = newest;
        }
        if (appendLow !== undefined && appendLow < lowestVal) {
            lowestIdx = newest;
        }

        const barsSinceHighest = newest - highestIdx;
        const barsSinceLowest = newest - lowestIdx;

        const up = (100 * (this.period - barsSinceHighest)) / this.period;
        const down = (100 * (this.period - barsSinceLowest)) / this.period;

        return { up, down };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
