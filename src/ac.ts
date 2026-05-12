import { SMA } from './sma';
import { AO } from './ao';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 The Accelerator Oscillator (AC indicator) is a technical analysis tool that helps
 to gauge the momentum in the market. It also helps to predict when the momentum will change.
 */

export class AC  implements StatefulIndicator<GenericIndicatorState> {
    private sma: SMA;
    private ao: AO;
    private smaValue: number;
    private aoValue: number;

    constructor() {
        this.sma = new SMA(5);
        this.ao = new AO();
    }

    nextValue(high: number, low: number) {
        this.aoValue = this.ao.nextValue(high, low);

        if (this.aoValue === undefined) {
            return;
        }

        this.smaValue = this.sma.nextValue(this.aoValue);

        if (this.smaValue === undefined) {
            return;
        }

        // Performance hack with method overrides speed up +30_000 op/sec
        this.nextValue = (high: number, low: number) => {
            this.aoValue = this.ao.nextValue(high, low);
            this.smaValue = this.sma.nextValue(this.aoValue);

            return this.aoValue - this.smaValue;
        };

        // Performance hack with method overrides
        this.momentValue = (high: number, low: number) => {
            return this.ao.momentValue(high, low) - this.sma.momentValue(this.aoValue);
        };

        return this.aoValue - this.smaValue;
    }

    momentValue(high: number, low: number) {
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
        if (this.aoValue === undefined || this.smaValue === undefined) return;

        this.nextValue = (high: number, low: number) => {
            this.aoValue = this.ao.nextValue(high, low);
            this.smaValue = this.sma.nextValue(this.aoValue);

            return this.aoValue - this.smaValue;
        };

        this.momentValue = (high: number, low: number) => {
            return this.ao.momentValue(high, low) - this.sma.momentValue(this.aoValue);
        };
    }
}
