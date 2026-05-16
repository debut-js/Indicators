import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Elder Ray Index (Bull Power / Bear Power)
 *
 * Bull Power = High - EMA
 * Bear Power = Low - EMA
 */
export class ElderRay  implements StatefulIndicator<GenericIndicatorState> {
    private ema: EMA;
    private fill = 0;

    /**
     * @param period Period for EMA (default: 13)
     */
    constructor(private period = 13) {
        this.ema = new EMA(period);
    }

    /**
     * Adds a new value and returns Bull Power and Bear Power
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    nextValue(high: number, low: number, close: number): { bull: number; bear: number } | undefined {
        const ema = this.ema.nextValue(close);
        this.fill++;
        if (this.fill < this.period) return;
        if (ema === undefined) return;
        const bull = high - ema;
        const bear = low - ema;
        this.nextValue = (high: number, low: number, close: number): { bull: number; bear: number } => {
            const e = this.ema.nextValue(close)!;
            return { bull: high - e, bear: low - e };
        };
        return { bull, bear };
    }

    /**
     * Calculates Bull Power and Bear Power for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    momentValue(high: number, low: number, close: number): { bull: number; bear: number } | undefined {
        const ema = this.ema.momentValue(close);
        if (ema === undefined) return;
        return { bull: high - ema, bear: low - ema };
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

        this.nextValue = (high: number, low: number, close: number): { bull: number; bear: number } => {
            const ema = this.ema.nextValue(close)!;
            return { bull: high - ema, bear: low - ema };
        };
    }
}
