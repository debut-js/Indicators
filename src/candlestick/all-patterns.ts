import {
    Doji, DragonFlyDoji, GraveStoneDoji,
    BearishHammerStick, BullishHammerStick,
    BearishInvertedHammerStick, BullishInvertedHammerStick,
    BearishMarubozu, BullishMarubozu,
    BearishSpinningTop, BullishSpinningTop,
    BearishEngulfingPattern, BullishEngulfingPattern,
    BearishHarami, BullishHarami,
    BearishHaramiCross, BullishHaramiCross,
    DarkCloudCover, PiercingLine,
    AbandonedBaby, DownsideTasukiGap,
    EveningStar, EveningDojiStar,
    MorningStar, MorningDojiStar,
    ThreeBlackCrows, ThreeWhiteSoldiers,
    HammerPattern, HammerPatternUnconfirmed,
    HangingMan, HangingManUnconfirmed,
    ShootingStar, ShootingStarUnconfirmed,
    TweezerBottom, TweezerTop,
} from './patterns';

/** Pattern names reported by the combined detectors. */
export type CandlestickPatternName =
    | 'Doji' | 'DragonFlyDoji' | 'GraveStoneDoji'
    | 'BearishHammerStick' | 'BullishHammerStick'
    | 'BearishInvertedHammerStick' | 'BullishInvertedHammerStick'
    | 'BearishMarubozu' | 'BullishMarubozu'
    | 'BearishSpinningTop' | 'BullishSpinningTop'
    | 'BearishEngulfingPattern' | 'BullishEngulfingPattern'
    | 'BearishHarami' | 'BullishHarami'
    | 'BearishHaramiCross' | 'BullishHaramiCross'
    | 'DarkCloudCover' | 'PiercingLine'
    | 'AbandonedBaby' | 'DownsideTasukiGap'
    | 'EveningStar' | 'EveningDojiStar'
    | 'MorningStar' | 'MorningDojiStar'
    | 'ThreeBlackCrows' | 'ThreeWhiteSoldiers'
    | 'HammerPattern' | 'HammerPatternUnconfirmed'
    | 'HangingMan' | 'HangingManUnconfirmed'
    | 'ShootingStar' | 'ShootingStarUnconfirmed'
    | 'TweezerBottom' | 'TweezerTop';

interface PatternLike {
    nextValue(o: number, h: number, l: number, c: number): boolean | undefined;
    momentValue(o: number, h: number, l: number, c: number): boolean | undefined;
}

interface NamedPattern {
    name: CandlestickPatternName;
    pattern: PatternLike;
}

/**
 * Convenience scanner that runs every individual pattern in
 * parallel and reports which ones fired on the current bar.
 *
 * Multi-bar patterns share the module-level singleton `OhlcBuffer`
 * declared in `./patterns.ts`, so spinning up the scanner doesn't
 * allocate per-pattern buffers — only the small predicate-state
 * fields each class needs.
 */
export class AllCandlestickPatterns {
    private patterns: NamedPattern[];

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; minShadowToBodyRatio?: number; equalityTolerance?: number } = {}) {
        const { precision, shadowToBodyRatio, minShadowToBodyRatio, equalityTolerance } = opts;
        this.patterns = [
            { name: 'Doji', pattern: new Doji({ precision }) },
            { name: 'DragonFlyDoji', pattern: new DragonFlyDoji({ precision }) },
            { name: 'GraveStoneDoji', pattern: new GraveStoneDoji({ precision }) },
            { name: 'BearishHammerStick', pattern: new BearishHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BullishHammerStick', pattern: new BullishHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BearishInvertedHammerStick', pattern: new BearishInvertedHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BullishInvertedHammerStick', pattern: new BullishInvertedHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BearishMarubozu', pattern: new BearishMarubozu({ precision }) },
            { name: 'BullishMarubozu', pattern: new BullishMarubozu({ precision }) },
            { name: 'BearishSpinningTop', pattern: new BearishSpinningTop({ minShadowToBodyRatio }) },
            { name: 'BullishSpinningTop', pattern: new BullishSpinningTop({ minShadowToBodyRatio }) },
            { name: 'BearishEngulfingPattern', pattern: new BearishEngulfingPattern() },
            { name: 'BullishEngulfingPattern', pattern: new BullishEngulfingPattern() },
            { name: 'BearishHarami', pattern: new BearishHarami() },
            { name: 'BullishHarami', pattern: new BullishHarami() },
            { name: 'BearishHaramiCross', pattern: new BearishHaramiCross({ precision }) },
            { name: 'BullishHaramiCross', pattern: new BullishHaramiCross({ precision }) },
            { name: 'DarkCloudCover', pattern: new DarkCloudCover() },
            { name: 'PiercingLine', pattern: new PiercingLine() },
            { name: 'AbandonedBaby', pattern: new AbandonedBaby({ precision }) },
            { name: 'DownsideTasukiGap', pattern: new DownsideTasukiGap() },
            { name: 'EveningStar', pattern: new EveningStar() },
            { name: 'EveningDojiStar', pattern: new EveningDojiStar({ precision }) },
            { name: 'MorningStar', pattern: new MorningStar() },
            { name: 'MorningDojiStar', pattern: new MorningDojiStar({ precision }) },
            { name: 'ThreeBlackCrows', pattern: new ThreeBlackCrows() },
            { name: 'ThreeWhiteSoldiers', pattern: new ThreeWhiteSoldiers() },
            { name: 'HammerPattern', pattern: new HammerPattern({ precision, shadowToBodyRatio }) },
            { name: 'HammerPatternUnconfirmed', pattern: new HammerPatternUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'HangingMan', pattern: new HangingMan({ precision, shadowToBodyRatio }) },
            { name: 'HangingManUnconfirmed', pattern: new HangingManUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'ShootingStar', pattern: new ShootingStar({ precision, shadowToBodyRatio }) },
            { name: 'ShootingStarUnconfirmed', pattern: new ShootingStarUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'TweezerBottom', pattern: new TweezerBottom({ equalityTolerance }) },
            { name: 'TweezerTop', pattern: new TweezerTop({ equalityTolerance }) },
        ];
    }

    nextValue(open: number, high: number, low: number, close: number): CandlestickPatternName[] {
        const fired: CandlestickPatternName[] = [];
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.nextValue(open, high, low, close) === true) {
                fired.push(this.patterns[i].name);
            }
        }
        return fired;
    }

    momentValue(open: number, high: number, low: number, close: number): CandlestickPatternName[] {
        const fired: CandlestickPatternName[] = [];
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.momentValue(open, high, low, close) === true) {
                fired.push(this.patterns[i].name);
            }
        }
        return fired;
    }
}

/** Bullish-only variants: subset of patterns that signal long entries. */
export class BullishPatterns {
    private patterns: NamedPattern[];

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; equalityTolerance?: number } = {}) {
        const { precision, shadowToBodyRatio, equalityTolerance } = opts;
        this.patterns = [
            { name: 'BullishEngulfingPattern', pattern: new BullishEngulfingPattern() },
            { name: 'DownsideTasukiGap', pattern: new DownsideTasukiGap() },
            { name: 'BullishHarami', pattern: new BullishHarami() },
            { name: 'BullishHaramiCross', pattern: new BullishHaramiCross({ precision }) },
            { name: 'MorningDojiStar', pattern: new MorningDojiStar({ precision }) },
            { name: 'MorningStar', pattern: new MorningStar() },
            { name: 'BullishMarubozu', pattern: new BullishMarubozu({ precision }) },
            { name: 'PiercingLine', pattern: new PiercingLine() },
            { name: 'ThreeWhiteSoldiers', pattern: new ThreeWhiteSoldiers() },
            { name: 'BullishHammerStick', pattern: new BullishHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BullishInvertedHammerStick', pattern: new BullishInvertedHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'HammerPattern', pattern: new HammerPattern({ precision, shadowToBodyRatio }) },
            { name: 'HammerPatternUnconfirmed', pattern: new HammerPatternUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'TweezerBottom', pattern: new TweezerBottom({ equalityTolerance }) },
        ];
    }

    nextValue(open: number, high: number, low: number, close: number): boolean {
        let any = false;
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.nextValue(open, high, low, close) === true) any = true;
        }
        return any;
    }

    momentValue(open: number, high: number, low: number, close: number): boolean {
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.momentValue(open, high, low, close) === true) return true;
        }
        return false;
    }
}

/** Bearish-only variants: subset of patterns that signal short entries. */
export class BearishPatterns {
    private patterns: NamedPattern[];

    constructor(opts: { precision?: number; shadowToBodyRatio?: number; equalityTolerance?: number } = {}) {
        const { precision, shadowToBodyRatio, equalityTolerance } = opts;
        this.patterns = [
            { name: 'BearishEngulfingPattern', pattern: new BearishEngulfingPattern() },
            { name: 'BearishHarami', pattern: new BearishHarami() },
            { name: 'BearishHaramiCross', pattern: new BearishHaramiCross({ precision }) },
            { name: 'EveningDojiStar', pattern: new EveningDojiStar({ precision }) },
            { name: 'EveningStar', pattern: new EveningStar() },
            { name: 'BearishMarubozu', pattern: new BearishMarubozu({ precision }) },
            { name: 'ThreeBlackCrows', pattern: new ThreeBlackCrows() },
            { name: 'BearishHammerStick', pattern: new BearishHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'BearishInvertedHammerStick', pattern: new BearishInvertedHammerStick({ precision, shadowToBodyRatio }) },
            { name: 'HangingMan', pattern: new HangingMan({ precision, shadowToBodyRatio }) },
            { name: 'HangingManUnconfirmed', pattern: new HangingManUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'ShootingStar', pattern: new ShootingStar({ precision, shadowToBodyRatio }) },
            { name: 'ShootingStarUnconfirmed', pattern: new ShootingStarUnconfirmed({ precision, shadowToBodyRatio }) },
            { name: 'TweezerTop', pattern: new TweezerTop({ equalityTolerance }) },
        ];
    }

    nextValue(open: number, high: number, low: number, close: number): boolean {
        let any = false;
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.nextValue(open, high, low, close) === true) any = true;
        }
        return any;
    }

    momentValue(open: number, high: number, low: number, close: number): boolean {
        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].pattern.momentValue(open, high, low, close) === true) return true;
        }
        return false;
    }
}
