import { LineEvent, LineDirective, Point } from './types';

type ExtremumPoint = {
    x: number;
    h: number;
    l: number;
};

/**
 * Line Model class.
 * this.index - index in lineDirectives array
 */
export class LineModel {
    public type!: 'h' | 'l';
    public index: number;
    public length: number; //Line's living time
    //TODO Make points window in FIFO stack
    public startPoint!: Point;
    public prevPoint!: Point;
    public thisPoint!: Point; // Current Point on the line
    public nextPoint!: Point;
    public candlePoint!: Point; // Point on the current candle
    public forked: boolean = false; // Flag of bounced line
    public forkedAt: number | null = 0;
    public forkedValue: number | null = null;
    public lastForkY: number | null = null; // Last fork or extremum point
    public k!: number;
    private b!: number;
    private step: number; // Step of time in minutes
    // rollback of the line: the case when a price change direction is opposite the line direction
    public rollback: {
        k: number;
        b: number;
        length: number;
        lastForkTime: number;
        lastForkValue: number;
    } | null;

    constructor(h: number | null, l: number | null, i: number, step: number, index: number, prevPoint: ExtremumPoint | null = null) {
        this.step = step;
        this.index = index;
        this.length = 0;
        // TODO On fork startPoint is the fork point not the candle point
        this.startPoint = prevPoint
            ? {
                  y: h != null ? prevPoint.h : prevPoint.l,
                  x: prevPoint.x,
              }
            : {
                  y: h != null ? h : l!,
                  x: i,
              };
        this.init(h, l, i);
        this.thisPoint = this.startPoint;
    }

    init(h: number | null, l: number | null, i: number) {
        if (!this.type) this.type = h != null ? 'h' : 'l';
        this.candlePoint = {
            y: this.type == 'h' ? h! : l!,
            x: i,
        };
        // Shift window if data exists
        if (this.thisPoint) {
            this.prevPoint = this.thisPoint;
            if (this.nextPoint) this.thisPoint = this.nextPoint;
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step,
            };
        }
    }

    /**
     * Update line object. Returns LineDirectives - actions list for the next candle based on prediction
     * @param h
     * @param l
     * @param i
     */
    update(h: number | null, l: number | null, i: number): LineDirective | null {
        let result: LineDirective | null = null;
        this.length++;
        this.init(h, l, i);
        // Init К b
        if (!this.k || isNaN(this.k)) {
            this.k = (this.candlePoint.y - this.startPoint.y) / (this.candlePoint.x - this.startPoint.x);
            this.b = this.candlePoint.y - this.k * this.candlePoint.x;
            this.prevPoint = this.startPoint;
            this.thisPoint = this.candlePoint;
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step,
            };
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.nextPoint.y,
                action: 'fork',
                lineIndex: this.index,
            };
        }
        // Update incline
        if (
            (this.type == 'h' && this.thisPoint.y <= this.candlePoint.y) ||
            (this.type == 'l' && this.thisPoint.y >= this.candlePoint.y)
        ) {
            this.k = (this.candlePoint.y - this.startPoint.y) / (this.candlePoint.x - this.startPoint.x);
            this.b = this.candlePoint.y - this.k * this.candlePoint.x;
            this.thisPoint = this.candlePoint;
            this.length = 0;
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step,
            };
            let rollbackTime = this.rollback ? this.rollback.length : 0;
            let rollbackIncline = this.candlePoint.y - this.prevPoint.y; // Take only one candle
            // Set rollback flag if moving away from the middle of price
            if (this.type == 'h' ? rollbackIncline > 0 : rollbackIncline < 0) {
                this.rollback = {
                    k: rollbackIncline,
                    b: this.candlePoint.y - rollbackIncline * this.candlePoint.x,
                    length: rollbackTime + 1,
                    lastForkTime: this.forkedAt || (this.rollback ? this.rollback.lastForkTime : 0),
                    lastForkValue: this.forkedValue || (this.rollback ? this.rollback.lastForkValue : 0),
                };
                // If rollback then the line lost the fork point
                // TODO Use accuracy to reset the forked value
                this.forked = false;
                this.forkedAt = null;
                this.forkedValue = null;
            } else {
                this.forkedAt = this.candlePoint.x;
                this.forkedValue = this.candlePoint.y;
                this.forked = true;
                this.rollback = null;
            }
            // Wait for bounce
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.nextPoint.y,
                action: 'fork',
                lineIndex: this.index,
            };
        } else {
            this.rollback = null;
        }
        return result;
    }

    /**
     * Update timescale
     * TODO operate in different time scale
     * @param step
     */
    updateStep(step) {
        this.step = step;
    }
}
