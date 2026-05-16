import { SMA, SMAState } from './sma';
import { dumpOptionalNumber, OptionalNumberState, restoreOptionalNumber, StatefulIndicator } from './stateful-indicator';

export interface RMAState {
    period: number;
    alpha: number;
    prevValue: OptionalNumberState;
    sma: SMAState;
}

/**
 * Relative Moving Average adds more weight to recent data (and gives less importance to older data).
 * This makes the RMA similar to the Exponential Moving Average, although it’s somewhat slower to respond than an EMA is.
 */
export class RMA implements StatefulIndicator<RMAState> {
    private prevValue: number | undefined;
    private alpha: number;
    private sma: SMA;

    constructor(private period: number = 14) {
        this.alpha = 1 / period;
        this.sma = new SMA(this.period);
    }

    nextValue(value: number): number | undefined {
        if (this.prevValue === undefined) {
            this.prevValue = this.sma.nextValue(value);
        } else {
            this.prevValue = this.alpha * value + (1 - this.alpha) * this.prevValue;

            this.nextValue = (value: number): number => {
                this.prevValue = this.alpha * value + (1 - this.alpha) * this.prevValue!;

                return this.prevValue;
            };
        }

        return this.prevValue;
    }

    momentValue(value: number): number | undefined {
        if (this.prevValue !== undefined) {
            return this.alpha * value + (1 - this.alpha) * this.prevValue;
        }
    }

    dumpState(): RMAState {
        return {
            period: this.period,
            alpha: this.alpha,
            prevValue: dumpOptionalNumber(this.prevValue),
            sma: this.sma.dumpState(),
        };
    }

    restoreState(state: RMAState): this {
        if (state.period !== this.period) {
            throw new Error(`RMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.alpha = state.alpha;
        this.prevValue = restoreOptionalNumber(state.prevValue);
        this.sma.restoreState(state.sma);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (this.prevValue === undefined) return;

        this.nextValue = (value: number): number => {
            this.prevValue = this.alpha * value + (1 - this.alpha) * this.prevValue!;

            return this.prevValue;
        };
    }
}
