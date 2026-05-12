import { StatefulIndicator } from './stateful-indicator';

export interface SMMAState {
    period: number;
    sum: number;
    avg: number;
    filled: boolean;
    fill: number;
}

/**
 * SMMA (Smoothed Moving Average) is another popular and widely used moving average indicator.
 * As all the other moving average indicators, to achieve the goals, the indicator filters
 * out the market fluctuations (noises) by averaging the price values of the periods, over which it is calculated.
 */
export class SMMA implements StatefulIndicator<SMMAState> {
    private sum = 0;
    private avg = 0;
    private filled = false;
    private fill = 0;

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.filled) {
            this.nextValue = (value: number) => (this.avg = (this.avg * (this.period - 1) + value) / this.period);
            return this.nextValue(value);
        }

        this.sum += value;
        this.fill++;

        if (this.fill === this.period) {
            this.filled = true;
            this.avg = this.sum / this.period;

            return this.avg;
        }
    }

    momentValue(value: number) {
        if (!this.filled) {
            return;
        }

        return (this.avg * (this.period - 1) + value) / this.period;
    }

    dumpState(): SMMAState {
        return {
            period: this.period,
            sum: this.sum,
            avg: this.avg,
            filled: this.filled,
            fill: this.fill,
        };
    }

    restoreState(state: SMMAState): this {
        if (state.period !== this.period) {
            throw new Error(`SMMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.sum = state.sum;
        this.avg = state.avg;
        this.filled = state.filled;
        this.fill = state.fill;
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (!this.filled) return;

        this.nextValue = (value: number) => (this.avg = (this.avg * (this.period - 1) + value) / this.period);
    }
}
