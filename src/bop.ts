import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Balance of Power (BOP)
 *
 *   BOP = (close - open) / (high - low)
 *
 * Pure per-bar calculation; no state. Returns NaN on a doji (high == low)
 * to mirror oakscriptjs's division-by-zero behaviour.
 */
export class BOP  implements StatefulIndicator<GenericIndicatorState> {
    nextValue(open: number, high: number, low: number, close: number) {
        const range = high - low;
        if (range === 0) return NaN;
        return (close - open) / range;
    }

    momentValue(open: number, high: number, low: number, close: number) {
        return this.nextValue(open, high, low, close);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
