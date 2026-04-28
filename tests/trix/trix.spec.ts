import { TRIX } from '../../src/trix';
import { TRIX as TRIX2 } from 'technicalindicators';
import { closes } from '../macd/excel-data';

describe('TRIX', () => {
    it('Cross sdk: matches technicalindicators TRIX when both produce a value', () => {
        const t1 = new TRIX(15);
        const t2 = new TRIX2({ period: 15, values: [] });
        for (const c of closes) {
            const a = t1.nextValue(c);
            const b = t2.nextValue(c);
            if (a !== undefined && b !== undefined) {
                expect(a).toBeCloseTo(b, 4);
            }
        }
    });
});
