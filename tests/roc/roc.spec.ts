import { ROC } from '../../src/roc';
import { ROC as ROC2 } from 'technicalindicators';
import { rocValues, closes } from './excel-data';

describe('ROC', () => {
    it('Excel Validate', () => {
        const ema = new ROC(5);

        closes.forEach((c, idx) => {
            const calculated = ema.nextValue(c);
            const excel = rocValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated! - excel! * 100)).toBeLessThan(0.0001);
            }
        });
    });

    it('Cross sdk validate', () => {
        const roc = new ROC(5);
        const roc2 = new ROC2({ period: 5, values: [] });

        closes.forEach((c) => {
            const local = roc.nextValue(c);
            const cross = roc2.nextValue(c);

            // console.log(local, cross);
            expect(local).toEqual(cross);
        });
    });
});
