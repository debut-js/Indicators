import { sum } from './utils';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * A linearly weighted moving average (LWMA) is a moving average calculation that more heavily weights recent price data.
 * The most recent price has the highest weighting, and each prior price has progressively less weight.
 * The weights drop in a linear fashion.
 * LWMAs are quicker to react to price changes than simple moving averages (SMA) and exponential moving averages (EMA).
 */
export class LWMA  implements StatefulIndicator<GenericIndicatorState> {
    // Circular buffer ned foreach or reduce for that case
    private arr: number[] = [];
    private filled = false;
    private devider = 0;
    private lastSum = 0;

    constructor(private period: number) {
        this.devider = sum(Array.from(Array(this.period).keys()).map((i) => i + 1));
    }

    nextValue(value: number) {
        this.filled = this.filled || this.arr.length === this.period;
        this.arr.push(value);

        if (this.filled) {
            this.arr.shift();
            return this.arr.reduce((sum, value, idx) => sum + value * (idx + 1), 0) / this.devider;
        }
    }

    momentValue(value: number) {
        if (this.filled) {
            const arr = this.arr.slice(1);

            arr.push(value);
            return arr.reduce((sum, value, idx) => sum + value * (idx + 1), 0) / this.devider;
        }
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
