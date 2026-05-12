import { SMA, SMAState } from './sma';
import { dumpOptionalNumber, OptionalNumberState, restoreOptionalNumber, StatefulIndicator } from './stateful-indicator';

export interface EMAState {
    period: number;
    smooth: number;
    ema: OptionalNumberState;
    sma: SMAState;
}

/**
 * An exponential moving average (EMA) is a type of moving average (MA)
 * that places a greater weight and significance on the most recent data points.
 * The exponential moving average is also referred to as the exponentially weighted moving average.
 * An exponentially weighted moving average reacts more significantly to recent price changes
 * than a simple moving average (SMA), which applies an equal weight to all observations in the period.
 */
export class EMA implements StatefulIndicator<EMAState> {
    private smooth: number;
    private ema: number | undefined;
    private sma: SMA;

    constructor(private period: number) {
        this.smooth = 2 / (this.period + 1);
        this.sma = new SMA(this.period);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number): number | undefined {
        const sma = this.sma.nextValue(value);

        if (sma !== undefined) {
            this.ema = sma;
            this.bindEmaNextValue();
        }

        return sma;
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number): number | undefined {
        return;
    }

    dumpState(): EMAState {
        return {
            period: this.period,
            smooth: this.smooth,
            ema: dumpOptionalNumber(this.ema),
            sma: this.sma.dumpState(),
        };
    }

    restoreState(state: EMAState): this {
        if (state.period !== this.period) {
            throw new Error(`EMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.smooth = state.smooth;
        this.ema = restoreOptionalNumber(state.ema);
        this.sma.restoreState(state.sma);
        this.bindEmaNextValue();

        return this;
    }

    private bindEmaNextValue(): void {
        delete (this as { nextValue?: EMA['nextValue'] }).nextValue;
        delete (this as { momentValue?: EMA['momentValue'] }).momentValue;
        if (this.ema === undefined) return;

        this.nextValue = (value: number): number => {
            return (this.ema = (value - this.ema!) * this.smooth + this.ema!);
        };
        this.momentValue = (value: number): number => {
            return (value - this.ema!) * this.smooth + this.ema!;
        };
    }
}
