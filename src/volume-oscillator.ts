import { SMA } from './sma';

/**
 * Volume Oscillator
 *
 * Volume Oscillator = SMA(short) - SMA(long)
 */
export class VolumeOscillator {
    private smaShort: SMA;
    private smaLong: SMA;
    private fill = 0;

    /**
     * @param shortPeriod Short period for SMA (default: 14)
     * @param longPeriod Long period for SMA (default: 28)
     */
    constructor(private shortPeriod = 14, private longPeriod = 28) {
        this.smaShort = new SMA(shortPeriod);
        this.smaLong = new SMA(longPeriod);
    }

    /**
     * Adds a new value and returns the Volume Oscillator
     * @param volume Volume of the current bar
     */
    nextValue(volume: number) {
        const short = this.smaShort.nextValue(volume);
        const long = this.smaLong.nextValue(volume);
        this.fill++;
        if (this.fill < this.longPeriod) return;
        const vo = short - long;
        this.nextValue = (volume: number) => {
            const short = this.smaShort.nextValue(volume);
            const long = this.smaLong.nextValue(volume);
            return short - long;
        };
        return vo;
    }

    /**
     * Calculates Volume Oscillator for the current (not closed) bar without changing the internal state
     * @param volume Volume of the current bar
     */
    momentValue(volume: number) {
        const short = this.smaShort.momentValue(volume);
        const long = this.smaLong.momentValue(volume);
        return short - long;
    }
} 