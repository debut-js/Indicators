import { WEMA } from '../wema';
import { EMA } from '../ema';
import { SMA } from '../sma';
import { Sampler, IndicatorConstructor } from './sampler';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from '../stateful-indicator';
/**
 * Level creation for dynamic data, upper and lower (configurated)
 */
export class UniLevel<T extends IndicatorConstructor> {
    private prevValue = 0;
    private lastUpperValue = 0;
    private lastLowerValue = 0;
    private samplerUp: Sampler<T>;
    private samplerLow: Sampler<T>;

    constructor(public redunant = 0.85, indicator: T, samples: number, private multiplier = 1, private offset = 1) {
        this.samplerUp = new Sampler<T>(indicator, samples);
        this.samplerLow = new Sampler<T>(indicator, samples);
    }

    public create(...args: ConstructorParameters<T>) {
        this.samplerUp.create(...args);
        this.samplerLow.create(...args);
    }

    public nextValue(value: number) {
        if (value > 0) {
            this.lastUpperValue = Math.max(value, this.prevValue);
        } else {
            this.lastUpperValue = Math.max(0, this.lastUpperValue) * this.redunant;
        }

        if (value <= 0) this.lastLowerValue = Math.min(value, this.prevValue);
        else {
            this.lastLowerValue = Math.min(0, this.lastLowerValue) * this.redunant;
        }

        const low = (value <= 0 ? value : this.lastLowerValue) * this.multiplier;
        const up = (value >= 0 ? value : this.lastUpperValue) * this.multiplier;

        return [this.samplerUp.nextValue(up) + this.offset, this.samplerLow.nextValue(low) - this.offset];
    }
}

/**
 * Smoothed level creation for dynamic data
 * @deprecated
 */
export class Level  implements StatefulIndicator<GenericIndicatorState> {
    private sample1Up: WEMA | SMA | EMA;
    private sample2Up: WEMA | SMA | EMA;
    private sample3Up: WEMA | SMA | EMA;
    private sample1Low: WEMA | SMA | EMA;
    private sample2Low: WEMA | SMA | EMA;
    private sample3Low: WEMA | SMA | EMA;

    private upper = 0;
    private lower = 0;
    private lastUpperValue = 0;
    private lastLowerValue = 0;

    constructor(
        public period: number,
        public samples: number,
        public redunant = 0.85,
        private type: 'WEMA' | 'EMA' | 'SMA' = 'WEMA',
    ) {
        this.sample1Up = this.createSample();
        this.sample2Up = this.createSample();
        this.sample3Up = this.createSample();
        this.sample1Low = this.createSample();
        this.sample2Low = this.createSample();
        this.sample3Low = this.createSample();
    }

    public nextValue(value: number) {
        if (value > 0) {
            this.upper = this.getUp(value);
            this.lastLowerValue *= this.redunant;
            this.lower = this.getDown(this.lastLowerValue);
            this.lastUpperValue = value;
        } else if (value < 0) {
            this.lower = this.getDown(value);
            this.lastUpperValue *= this.redunant;
            this.upper = this.getUp(this.lastUpperValue);
            this.lastLowerValue = value;
        }

        return { upper: this.upper, lower: this.lower };
    }

    public getUp(value: number) {
        const sample1 = this.sample1Up.nextValue(value);
        let sample2: number | null = null;

        if (this.samples === 1) {
            return sample1;
        }

        if (sample1) {
            sample2 = this.sample2Up.nextValue(sample1);
        }

        if (this.samples === 2) {
            return sample2;
        }

        if (sample2) {
            return this.sample3Up.nextValue(sample2);
        }

        return null;
    }

    public getDown(value: number) {
        const sample1 = this.sample1Low.nextValue(value);
        let sample2: number | null = null;

        if (this.samples === 1) {
            return sample1;
        }

        if (sample1) {
            sample2 = this.sample2Low.nextValue(sample1);
        }

        if (this.samples === 2) {
            return sample2;
        }

        if (sample2) {
            return this.sample3Low.nextValue(sample2);
        }

        return null;
    }

    private createSample() {
        switch (this.type) {
            case 'EMA':
                return new EMA(this.period);
            case 'WEMA':
                return new WEMA(this.period);
            case 'SMA':
                return new SMA(this.period);
        }
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
