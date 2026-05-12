import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * The Welles Wilder's Smoothing Average (WWS) was developed by J. Welles Wilder, Jr. and is part of the Wilder's RSI indicator implementation.
 * This indicator smoothes price movements to help you identify and spot bullish and bearish trends.
 */
export class WWS  implements StatefulIndicator<GenericIndicatorState> {
    private prevValue: number = 0;
    private sumCount = 1;

    constructor(private period: number) {}

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number) {
        if (this.sumCount < this.period) {
            this.prevValue += value;
            this.sumCount++;

            return;
        }

        if (this.sumCount === this.period) {
            this.prevValue += value;
            this.sumCount++;

            this.nextValue = (value: number) =>
                (this.prevValue = this.prevValue - this.prevValue / this.period + value);

            return this.prevValue;
        }
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number) {
        if (this.sumCount < this.period) {
            return;
        }

        return this.prevValue - this.prevValue / this.period + value;
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
        if (this.sumCount <= this.period) return;

        this.nextValue = (value: number) =>
            (this.prevValue = this.prevValue - this.prevValue / this.period + value);
    }
}
