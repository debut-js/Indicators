import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Arnaud Legoux Moving Average (ALMA)
 *
 * A moving average using Gaussian weights centered at `offset * (length - 1)`
 * with sharpness controlled by `sigma`. Lower offsets produce a more
 * responsive curve; higher sigmas produce a sharper Gaussian and therefore
 * heavier weighting near the centre.
 *
 * Weights are precomputed once and reused per bar, so the streaming cost
 * is O(period) per `nextValue`.
 */
export class ALMA  implements StatefulIndicator<GenericIndicatorState> {
    private buffer: CircularBuffer<number>;
    private weights: number[];

    constructor(private period = 9, offset = 0.85, sigma = 6, floor = false) {
        this.buffer = new CircularBuffer(period);

        const m = floor ? Math.floor(offset * (period - 1)) : offset * (period - 1);
        const s = period / sigma;
        const weights: number[] = [];
        let weightSum = 0;
        for (let i = 0; i < period; i++) {
            const w = Math.exp((-1 * Math.pow(i - m, 2)) / (2 * Math.pow(s, 2)));
            weights.push(w);
            weightSum += w;
        }
        for (let i = 0; i < period; i++) {
            weights[i] /= weightSum;
        }
        this.weights = weights;
    }

    nextValue(value: number): number | undefined {
        this.buffer.push(value);

        if (!this.buffer.filled) {
            return;
        }

        let result = 0;
        // CircularBuffer.forEach iterates from oldest (idx=0) to newest;
        // ALMA expects weight[0] applied to the oldest value, matching the
        // oakscriptjs reference implementation.
        this.buffer.forEach((v: number | undefined, idx: number): void => {
            const weight = this.weights[idx];
            if (v === undefined || weight === undefined) return;

            result += v * weight;
        });
        return result;
    }

    momentValue(value: number): number | undefined {
        // Model the hypothetical post-push window without mutating state.
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period - 1) {
                return;
            }
            // The hypothetical push would fill the buffer with no eviction:
            // existing values keep their oldest→newest order at weights
            // [0..period-2], and `value` takes weights[period-1].
            let result = 0;
            for (let i = 0; i < this.period - 1; i++) {
                const bufferedValue = this.buffer.at(i);
                const weight = this.weights[i];
                if (bufferedValue === undefined || weight === undefined) return;

                result += bufferedValue * weight;
            }
            const lastWeight = this.weights[this.period - 1];
            if (lastWeight === undefined) return;

            result += value * lastWeight;
            return result;
        }

        // Buffer is full: hypothetical push evicts at(0); remaining
        // entries shift one weight slot down and `value` lands last.
        let result = 0;
        for (let i = 0; i < this.period - 1; i++) {
            const bufferedValue = this.buffer.at(i + 1);
            const weight = this.weights[i];
            if (bufferedValue === undefined || weight === undefined) return;

            result += bufferedValue * weight;
        }
        const lastWeight = this.weights[this.period - 1];
        if (lastWeight === undefined) return;

        result += value * lastWeight;
        return result;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
