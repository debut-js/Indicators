import { CircularBuffer } from './circular-buffer';
import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from '../stateful-indicator';
/**
 * Returns the percentile of a value. Returns the same values as the Excel PERCENTRANK and PERCENTRANK.INC functions.
 */
export class PercentRank implements StatefulIndicator<GenericIndicatorState> {
    private values: CircularBuffer;
    private fill = 0;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    public nextValue(value: number) {
        this.values.push(value);
        this.fill++;

        if (this.fill === this.period) {
            this.nextValue = (value: number) => {
                const result = this.calc(value);

                this.values.push(value);

                return result;
            };

            this.momentValue = this.calc;

            return this.calc(value);
        }
    }

    public momentValue(value: number): number {
        return;
    }

    private calc(value: number) {
        let count = 0;

        this.values.toArray().forEach((item) => {
            if (item <= value) count++;
        });

        return (count / this.period) * 100;
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
        if (this.fill < this.period) return;

        this.nextValue = (value: number) => {
            const result = this.calc(value);

            this.values.push(value);

            return result;
        };

        this.momentValue = this.calc;
    }
}
