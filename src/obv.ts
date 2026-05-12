import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * On Balance Volume (OBV)
 *
 * Cumulative indicator that adds volume on up bars and subtracts it on down bars.
 * The first bar contributes 0 (no previous close to compare against).
 */
export class OBV  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private value = 0;

    nextValue(close: number, volume: number) {
        if (this.prevClose === undefined) {
            this.prevClose = close;
            return this.value;
        }

        if (close > this.prevClose) {
            this.value += volume;
        } else if (close < this.prevClose) {
            this.value -= volume;
        }

        this.prevClose = close;
        return this.value;
    }

    momentValue(close: number, volume: number) {
        if (this.prevClose === undefined) {
            return this.value;
        }

        if (close > this.prevClose) {
            return this.value + volume;
        }
        if (close < this.prevClose) {
            return this.value - volume;
        }
        return this.value;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
