import { CircularBuffer, CircularBufferState } from './providers/circular-buffer';
import { StatefulIndicator } from './stateful-indicator';

export interface SMAState {
    period: number;
    sum: number;
    circular: CircularBufferState<number>;
}
// console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

export class SMA implements StatefulIndicator<SMAState> {
    private circular: CircularBuffer;
    private sum = 0;

    constructor(private period: number) {
        this.circular = new CircularBuffer(period);
    }

    nextValue(value: number) {
        this.circular.push(value);
        this.sum += value;

        if (!this.circular.filled) {
            return;
        }

        this.nextValue = (value: number) => {
            this.sum = this.sum - this.circular.push(value) + value;

            return this.sum / this.period;
        };

        return this.sum / this.period;
    }

    /** Same window as the next {@link nextValue} would use, without advancing state (see debut-js/Indicators#38). */
    momentValue(value: number) {
        if (!this.circular.filled) {
            if (this.circular.loaded === this.period - 1) {
                return (this.sum + value) / this.period;
            }
            return;
        }

        return (this.sum - this.circular.peek() + value) / this.period;
    }

    dumpState(): SMAState {
        return {
            period: this.period,
            sum: this.sum,
            circular: this.circular.dumpState(),
        };
    }

    restoreState(state: SMAState): this {
        if (state.period !== this.period) {
            throw new Error(`SMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.sum = state.sum;
        this.circular.restoreState(state.circular);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (!this.circular.filled) return;

        this.nextValue = (value: number) => {
            this.sum = this.sum - this.circular.push(value) + value;

            return this.sum / this.period;
        };
    }
}
