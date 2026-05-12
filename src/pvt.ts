import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Price Volume Trend (PVT)
 *
 * Cumulative running total of `(close - prevClose) / prevClose * volume`.
 * The first bar has no previous close to compare against and contributes 0.
 * Bars where `prevClose === 0` contribute 0 to mirror the oakscriptjs
 * reference implementation's guard.
 */
export class PVT  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private value = 0;

    nextValue(close: number, volume: number) {
        if (this.prevClose === undefined) {
            this.prevClose = close;
            return 0;
        }
        if (this.prevClose !== 0) {
            const change = close - this.prevClose;
            this.value += (change / this.prevClose) * volume;
        }
        this.prevClose = close;
        return this.value;
    }

    momentValue(close: number, volume: number) {
        if (this.prevClose === undefined) return 0;
        if (this.prevClose === 0) return this.value;
        const change = close - this.prevClose;
        return this.value + (change / this.prevClose) * volume;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
