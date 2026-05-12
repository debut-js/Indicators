import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Pivot points are major support and resistance levels where there likely to be a retracement
 * of price used by traders to objectively determine potential entry and exit levels of underlying assets.
 * Pivot point breaks can be an entry marker, confirmation of trend direction
 * also confirmation of trend reversal -exit marker.
 * These retracement calculation is based on the last day trading data as we follow
 * the market open, high, low, close on every day.
 * You can also calculate these pivot level on weekly basis.
 * For weekly pivot you need to weekly high, low, and close prices.
 */

type PivotMode = 'classic' | 'woodie' | 'camarilla' | 'fibonacci';

interface PivotValue {
    r6?: number;
    r5?: number;
    r4?: number;
    r3?: number;
    r2: number;
    r1: number;
    pp: number;
    s1: number;
    s2: number;
    s3?: number;
    s4?: number;
    s5?: number;
    s6?: number;
}
export class Pivot  implements StatefulIndicator<GenericIndicatorState> {
    private calculator: (h: number, l: number, c: number) => PivotValue;

    constructor(private mode: PivotMode = 'classic') {
        switch (this.mode) {
            case 'classic':
                this.calculator = this.classic;
                break;
            case 'camarilla':
                this.calculator = this.camarilla;
                break;
            case 'woodie':
                this.calculator = this.woodie;
                break;
            case 'fibonacci':
                this.calculator = this.fibonacci;
                break;
        }
    }

    public nextValue(h: number, l: number, c: number) {
        return this.calculator(h, l, c);
    }

    // Classsic
    // Pivot Point (P) = (High + Low + Close)/3
    // Support 1 (S1) = (P x 2) - High
    // Support 2 (S2) = P  -  (High  -  Low)
    // Support 3 (S3) = Low – 2(High – PP)
    // Resistance 1 (R1) = (P x 2) - Low
    // Resistance 2 (R2) = P + (High  -  Low)
    // Resistance 3 (R3) = High + 2(PP – Low)
    private classic(h: number, l: number, c: number) {
        const pp = (h + l + c) / 3;
        const s1 = pp * 2 - h;
        const s2 = pp - (h - l);
        const s3 = l - 2 * (h - pp);
        const r1 = pp * 2 - l;
        const r2 = pp + (h - l);
        const r3 = h + 2 * (pp - l);

        return { r3, r2, r1, pp, s1, s2, s3 };
    }

    // Woodie
    //R2 = PP + High – Low
    // R1 = (2 X PP) – Low
    // PP = (H + L + 2C) / 4
    // S1 = (2 X PP) – High
    // S2 = PP – High + Low
    private woodie(h: number, l: number, c: number) {
        const pp = (h + l + 2 * c) / 4;
        const r2 = pp + h - l;
        const r1 = 2 * pp - l;
        const s1 = 2 * pp - h;
        const s2 = pp - h + l;

        return { r2, r1, pp, s1, s2 };
    }

    //Camarilla
    // pivot = (high + low + close ) / 3.0
    // range = high - low
    // h5 = (high/low) * close
    // h4 = close + (high - low) * 1.1 / 2.0
    // h3 = close + (high - low) * 1.1 / 4.0
    // h2 = close + (high - low) * 1.1 / 6.0
    // h1 = close + (high - low) * 1.1 / 12.0
    // l1 = close - (high - low) * 1.1 / 12.0
    // l2 = close - (high - low) * 1.1 / 6.0
    // l3 = close - (high - low) * 1.1 / 4.0
    // l4 = close - (high - low) * 1.1 / 2.0
    // h6 = h5 + 1.168 * (h5 - h4)
    // l5 = close - (h5 - close)
    // l6 = close - (h6 - close)
    private camarilla(h: number, l: number, c: number) {
        const delta = (h - l) * 1.1;
        const pp = (h + l + c) / 3;
        const r5 = (h / l) * c;
        const r4 = c + delta / 2;
        const r6 = r5 + 1.168 * (r5 - r4);
        const r3 = c + delta / 4;
        const r2 = c + delta / 6;
        const r1 = c + delta / 12;
        const s1 = c - delta / 12;
        const s2 = c - delta / 6;
        const s3 = c - delta / 4;
        const s4 = c - delta / 2;
        const s5 = c - (r5 - c);
        const s6 = c - (r6 - c);

        return { r6, r5, r4, r3, r2, r1, pp, s1, s2, s3, s4, s5, s6 };
    }

    // Fibonacci Pivot Point
    // R3 = PP + ((High – Low) x 1.000)
    // R2 = PP + ((High – Low) x .618)
    // R1 = PP + ((High – Low) x .382)
    // PP = (H + L + C) / 3
    // S1 = PP – ((High – Low) x .382)
    // S2 = PP – ((High – Low) x .618)
    // S3 = PP – ((High – Low) x 1.000)
    private fibonacci(h: number, l: number, c: number) {
        const delta = h - l;
        const pp = (h + l + c) / 3;
        const r3 = pp + delta;
        const r2 = pp + delta * 0.618;
        const r1 = pp + delta * 0.382;
        const s1 = pp - delta * 0.382;
        const s2 = pp - delta * 0.618;
        const s3 = pp - delta;

        return { r3, r2, r1, pp, s1, s2, s3 };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        restoreObjectState(this, state);
        this.bindCalculator();

        return this;
    }

    private bindCalculator(): void {
        switch (this.mode) {
            case 'classic':
                this.calculator = this.classic;
                break;
            case 'camarilla':
                this.calculator = this.camarilla;
                break;
            case 'woodie':
                this.calculator = this.woodie;
                break;
            case 'fibonacci':
                this.calculator = this.fibonacci;
                break;
        }
    }
}
