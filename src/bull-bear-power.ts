import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Bull-Bear Power (Elder)
 *
 *   bullPower = high - EMA(close, length)
 *   bearPower = low  - EMA(close, length)
 *   BBP       = bullPower + bearPower = high + low - 2 * EMA(close, length)
 *
 * Returns `undefined` until the EMA has warmed up.
 */
export class BullBearPower  implements StatefulIndicator<GenericIndicatorState> {
    private ema: EMA;

    constructor(period = 13) {
        this.ema = new EMA(period);
    }

    nextValue(high: number, low: number, close: number) {
        const e = this.ema.nextValue(close);
        if (e === undefined) return;
        return high + low - 2 * e;
    }

    momentValue(high: number, low: number, close: number) {
        const e = this.ema.momentValue(close);
        if (e === undefined) return;
        return high + low - 2 * e;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
