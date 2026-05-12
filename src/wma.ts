import { CircularBuffer, CircularBufferState } from './providers/circular-buffer';
import { StatefulIndicator } from './stateful-indicator';

export interface WMAState {
    period: number;
    denominator: number;
    buffer: CircularBufferState<number>;
}

/**
 * Weighted moving average (WMA) assign a heavier weighting to more current data points since they are more relevant than data points
 * in the distant past. The sum of the weighting should add up to 1 (or 100%).
 * In the case of the simple moving average, the weightings are equally distributed, which is why they are not shown in the table above.
 */
export class WMA implements StatefulIndicator<WMAState> {
    private denominator: number;
    private buffer: CircularBuffer;
    private values: number[];

    constructor(private period: number) {
        this.denominator = (period * (period + 1)) / 2;
        this.buffer = new CircularBuffer(period);
        this.values = [];
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number) {
        this.buffer.push(value);

        if (!this.buffer.filled) {
            return;
        }

        let result = 0;

        this.buffer.forEach((v, idx) => {
            result += (v * (idx + 1)) / this.denominator;
        });

        return result;
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number) {
        // Compute the WMA over the hypothetical post-push window
        // without mutating the buffer. WMA weights run 1..period from
        // oldest to newest; weight `period` is reserved for `value`.
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period - 1) {
                return;
            }
            // Buffer would fill on this push with no eviction.
            let result = 0;
            for (let i = 0; i < this.period - 1; i++) {
                result += ((this.buffer.at(i) as number) * (i + 1)) / this.denominator;
            }
            result += (value * this.period) / this.denominator;
            return result;
        }

        // Filled: hypothetical push evicts at(0); existing entries
        // shift down one weight slot, `value` lands at weight=period.
        let result = 0;
        for (let i = 0; i < this.period - 1; i++) {
            result += ((this.buffer.at(i + 1) as number) * (i + 1)) / this.denominator;
        }
        result += (value * this.period) / this.denominator;
        return result;
    }

    dumpState(): WMAState {
        return {
            period: this.period,
            denominator: this.denominator,
            buffer: this.buffer.dumpState(),
        };
    }

    restoreState(state: WMAState): this {
        if (state.period !== this.period) {
            throw new Error(`WMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.denominator = state.denominator;
        this.buffer.restoreState(state.buffer);

        return this;
    }
}
