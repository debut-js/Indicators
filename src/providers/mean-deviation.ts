import { CircularBuffer } from './circular-buffer';
import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from '../stateful-indicator';
export class MeanDeviationProvider implements StatefulIndicator<GenericIndicatorState> {
    private values: CircularBuffer;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    nextValue(typicalPrice: number, average?: number): number | undefined {
        if (average === undefined) {
            this.values.push(typicalPrice);
            return void 0;
        }

        this.nextValue = this.pureNextValue;
        this.momentValue = this.pureMomentValue;

        return this.pureNextValue(typicalPrice, average);
    }

    momentValue(typicalPrice: number, average?: number): number | undefined {
        return void 0;
    }

    private pureNextValue(typicalPrice: number, average: number): number {
        this.values.push(typicalPrice);

        return this.values.toArray().reduce((acc, value) => acc + this.positiveDelta(average, value), 0) / this.period;
    }

    private pureMomentValue(typicalPrice: number, average: number): number {
        // Sum the absolute deviations over the hypothetical post-push
        // window without mutating the buffer: skip the slot that would
        // be evicted (when filled) and tack on `typicalPrice` as the
        // newest entry.
        const startOffset = this.values.filled ? 1 : 0;
        const realCount = this.values.loaded - startOffset;

        let sum = this.positiveDelta(average, typicalPrice);
        for (let i = 0; i < realCount; i++) {
            sum += this.positiveDelta(average, this.values.at(i + startOffset) as number);
        }

        return sum / this.period;
    }

    private positiveDelta(a: number, b: number) {
        return a > b ? a - b : b - a;
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
        if (this.values.loaded === 0) return;

        this.nextValue = this.pureNextValue;
        this.momentValue = this.pureMomentValue;
    }
}
