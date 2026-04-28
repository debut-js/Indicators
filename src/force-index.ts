/**
 * Force Index
 *
 * Force Index = (Current Close - Previous Close) * Volume
 */
export class ForceIndex {
    private prevClose: number;
    private fill = 0;

    /**
     * No parameters (uses raw calculation)
     */
    constructor() {}

    /**
     * Adds a new value and returns the Force Index
     * @param close Close price of the current bar
     * @param volume Volume of the current bar
     */
    nextValue(close: number, volume: number) {
        if (this.prevClose === undefined) {
            this.prevClose = close;
            return;
        }
        const force = (close - this.prevClose) * volume;
        this.prevClose = close;
        this.fill++;
        this.nextValue = (close: number, volume: number) => {
            const force = (close - this.prevClose) * volume;
            this.prevClose = close;
            return force;
        };
        return force;
    }

    /**
     * Calculates Force Index for the current (not closed) bar without changing the internal state
     * @param close Close price of the current bar
     * @param volume Volume of the current bar
     */
    momentValue(close: number, volume: number) {
        if (this.prevClose === undefined) return;
        return (close - this.prevClose) * volume;
    }
} 