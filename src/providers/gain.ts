import { SMMA, SMMAState } from '../smma';
import { dumpOptionalNumber, OptionalNumberState, restoreOptionalNumber, StatefulIndicator } from '../stateful-indicator';

export interface AvgChangeProviderState {
    avgGain: SMMAState;
    avgLoss: SMMAState;
    prev: OptionalNumberState;
}

export class AvgChangeProvider implements StatefulIndicator<AvgChangeProviderState> {
    private avgGain: SMMA;
    private avgLoss: SMMA;
    private prev: number | undefined;

    constructor(period: number) {
        this.avgGain = new SMMA(period);
        this.avgLoss = new SMMA(period);
    }

    nextValue(value: number) {
        if (this.prev === undefined) {
            this.prev = value;
            return;
        }

        const change = value - this.prev;
        const isPositive = change > 0;
        const isNegative = change < 0;
        const localGain = isPositive ? change : 0;
        const localLoss = isNegative ? change : 0;
        const upAvg = this.avgGain.nextValue(localGain);
        const downAvg = this.avgLoss.nextValue(localLoss);

        this.prev = value;

        return { upAvg, downAvg };
    }

    momentValue(value: number) {
        if (this.prev === undefined) {
            return;
        }

        const change = value - this.prev;
        const isPositive = change > 0;
        const isNegative = change < 0;
        const localGain = isPositive ? change : 0;
        const localLoss = isNegative ? change : 0;
        const upAvg = this.avgGain.momentValue(localGain);
        const downAvg = this.avgLoss.momentValue(localLoss);

        return { upAvg, downAvg };
    }

    dumpState(): AvgChangeProviderState {
        return {
            avgGain: this.avgGain.dumpState(),
            avgLoss: this.avgLoss.dumpState(),
            prev: dumpOptionalNumber(this.prev),
        };
    }

    restoreState(state: AvgChangeProviderState): this {
        this.avgGain.restoreState(state.avgGain);
        this.avgLoss.restoreState(state.avgLoss);
        this.prev = restoreOptionalNumber(state.prev);

        return this;
    }
}
