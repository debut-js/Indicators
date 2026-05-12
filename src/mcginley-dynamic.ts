import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * McGinley Dynamic
 *
 *   MD[i] = MD[i-1] + (price - MD[i-1]) / (length * (price / MD[i-1])^4)
 *
 * Self-adjusting MA that speeds up in down markets and slows down in
 * up markets. Seeds with the first source value (no SMA warmup), so
 * `nextValue` returns a number from the very first call. Mirrors the
 * oakscriptjs reference implementation, including its safety net
 * against `MD === 0`.
 */
export class McGinleyDynamic  implements StatefulIndicator<GenericIndicatorState> {
    private md: number | undefined;

    constructor(private period = 14) {}

    nextValue(value: number) {
        if (this.md === undefined || this.md === 0) {
            this.md = value;
            return this.md;
        }
        const ratio = value / this.md;
        const k = this.period * Math.pow(ratio, 4);
        this.md = this.md + (value - this.md) / k;
        return this.md;
    }

    momentValue(value: number) {
        if (this.md === undefined || this.md === 0) return value;
        const ratio = value / this.md;
        const k = this.period * Math.pow(ratio, 4);
        return this.md + (value - this.md) / k;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
