import { SMA } from './sma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Moving Average Envelopes
 *
 * Envelopes are plotted at a fixed percentage above and below a moving average (usually SMA).
 *
 * - Upper Envelope: SMA + (SMA * percent / 100)
 * - Lower Envelope: SMA - (SMA * percent / 100)
 */
export class Envelopes  implements StatefulIndicator<GenericIndicatorState> {
    private sma: SMA;
    private fill = 0;

    /**
     * @param period Period for the moving average (default: 20)
     * @param percent Envelope distance in percent (default: 2)
     */
    constructor(private period = 20, private percent = 2) {
        this.sma = new SMA(period);
    }

    /**
     * Adds a new value and returns the envelopes
     * @param close Close price of the current bar
     */
    nextValue(close: number) {
        const middle = this.sma.nextValue(close);
        this.fill++;
        if (this.fill !== this.period) {
            return;
        }
        const deviation = middle * this.percent / 100;
        const upper = middle + deviation;
        const lower = middle - deviation;

        this.nextValue = (close: number) => {
            const middle = this.sma.nextValue(close);
            const deviation = middle * this.percent / 100;
            const upper = middle + deviation;
            const lower = middle - deviation;
            return { lower, middle, upper };
        };
        return { lower, middle, upper };
    }

    /**
     * Calculates envelopes for the current (not closed) bar without changing the internal state
     * @param close Close price of the current bar
     */
    momentValue(close: number) {
        const middle = this.sma.momentValue(close);
        const deviation = middle * this.percent / 100;
        const upper = middle + deviation;
        const lower = middle - deviation;
        return { lower, middle, upper };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        restoreObjectState(this, state);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (this.fill < this.period) return;

        this.nextValue = (close: number) => {
            const middle = this.sma.nextValue(close);
            const deviation = middle * this.percent / 100;
            const upper = middle + deviation;
            const lower = middle - deviation;
            return { lower, middle, upper };
        };
    }
}
