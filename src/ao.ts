import { SMA } from './sma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 Awesome Oscillator (AO) is an indicator that is non-limiting oscillator,
 providing insight into the weakness or the strength of a stock.
 The Awesome Oscillator is used to measure market momentum and
 to affirm trends or to anticipate possible reversals.
 */

export class AO  implements StatefulIndicator<GenericIndicatorState> {
    private smaSlow: SMA;
    private smaFast: SMA;
    private smaSlowValue: number;
    private smaFastValue: number;

    constructor(fastPeriod = 5, slowPeriod = 34) {
        this.smaSlow = new SMA(slowPeriod);
        this.smaFast = new SMA(fastPeriod);
    }

    nextValue(high: number, low: number) {
        this.smaSlowValue = this.smaSlow.nextValue((high + low) / 2);
        this.smaFastValue = this.smaFast.nextValue((high + low) / 2);

        if (this.smaSlowValue === undefined || this.smaFastValue === undefined) {
            return;
        }

        this.nextValue = (high: number, low: number) => {
            this.smaSlowValue = this.smaSlow.nextValue((high + low) / 2);
            this.smaFastValue = this.smaFast.nextValue((high + low) / 2);

            return this.smaFastValue - this.smaSlowValue;
        };

        this.momentValue = (high: number, low: number) => {
            return this.smaFast.momentValue((high + low) / 2) - this.smaSlow.momentValue((high + low) / 2);
        };

        return this.smaFastValue - this.smaSlowValue;
    }

    momentValue(high: number, low: number): number {
        return;
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
        delete (this as any).momentValue;
        if (this.smaSlowValue === undefined || this.smaFastValue === undefined) return;

        this.nextValue = (high: number, low: number) => {
            this.smaSlowValue = this.smaSlow.nextValue((high + low) / 2);
            this.smaFastValue = this.smaFast.nextValue((high + low) / 2);

            return this.smaFastValue - this.smaSlowValue;
        };

        this.momentValue = (high: number, low: number) => {
            return this.smaFast.momentValue((high + low) / 2) - this.smaSlow.momentValue((high + low) / 2);
        };
    }
}
