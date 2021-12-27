import { LineModel } from './line'
import { LineEvent, LineDirective, Point } from './types'

export class TrendLines {
    public hLineDirectives: LineDirective[]
    public lLineDirectives: LineDirective[]
    private hLines: LineModel[]
    private lLines: LineModel[]
    private step: number = 1        // TODO operate in different time scale
    private i: number = 0
    // Settings
    private slidingMethod = true   // Set draw method
    private maxForks = 10           // Forks of line
    // Debug values
    localCounter = 0
    consoleWindow: boolean
    minLog
    maxLog

    constructor(maxForks = 10, slidingMethod = true, minLog = 0, maxLog = 10) {
        this.maxForks = maxForks
        this.slidingMethod = slidingMethod
        this.minLog = minLog
        this.maxLog = maxLog
    }

    log(title, ...data) {
        this.consoleWindow = this.minLog < this.localCounter && this.localCounter < this.maxLog
        if (this.consoleWindow)
            console.log(title, ...data)
    }

    /**
     * Operate next candle method
     * @param o
     * @param c
     * @param h
     * @param l
     * @returns - arrow of 6 lines points
     */
    nextValue(o: number, c: number, h: number, l: number) {
        let result: number[];
        this.localCounter++ //Debug only

        // Apply line directives got on prevues step
        if (this.lLines && this.lLineDirectives) {
            this.log('Before ldirs', [this.localCounter, ...this.lLineDirectives, this.lLines.length])
            // TODO Fork only last line in Array
            this.lLineDirectives.forEach((d, i) => {
                if (d.condition == 'gt' && l > d.value && d.action == 'fork') {
                    let NL = new LineModel(null, l, this.i, this.step, this.lLines.length)
                    this.lLines.push(NL)
                }
            })
        }
        if (this.hLines && this.hLineDirectives) {
            this.log('Before hdirs', [this.localCounter, ...this.hLineDirectives, this.hLines.length])
            this.hLineDirectives.forEach((d, i) => {
                if (d.condition == 'lt' && h < d.value && d.action == 'fork') {
                    let NL = new LineModel(h, null, this.i, this.step, this.hLines.length)
                    this.hLines.push(NL)
                }
            })
        }
        // Update lines and get future directives
        this.hLineDirectives.length = 0
        this.lLineDirectives.length = 0
        if (!this.hLines) {
            let tLine = new LineModel(h, null, this.i, this.step, 0)
            this.hLines = [tLine]
            tLine = new LineModel(null, l, this.i, this.step, 0)
            this.lLines = [tLine]
        } else {
            let updated
            this.hLines.forEach((tline, i) => {
                updated = null
                if (tline.startPoint.x < this.i) // Skip the case if line was just created. TODO make it gracefully
                    updated = tline.update(h, null, this.i)
                if (updated)
                    this.hLineDirectives.push(updated)
                // Drop extreme lines
                if (tline.thisPoint.y > h * 1.2)
                    this.hLines.splice(i, 1)

            })
            this.lLines.forEach((tline, i) => {
                updated = null
                if (tline.startPoint.x < this.i) // Skip the case if line was just created. TODO make it gracefully
                    updated = tline.update(null, l, this.i)
                if (updated)
                    this.lLineDirectives.push(updated)
                // Drop extreme lines
                if (tline.thisPoint.y < l * 0.8)
                    this.lLines.splice(i, 1)
            })
        }

        //Delete passed trends
        let toDelete
        let IntermediateResult

        if (this.lLines) {
            toDelete = []
            this.lLines.forEach((l, i) => {
                if (i > 0 && this.lLines[i].thisPoint && this.lLines[i - 1].thisPoint.y >= this.lLines[i].thisPoint.y || i > this.maxForks) {
                    toDelete.push(i)
                    /*                     if (this.lLines && this.consoleWindow && this.lLines[i].thisPoint && this.lLines[i - 1].thisPoint)
                                            this.log('curPoint', this.lLines[i - 1].thisPoint.y, this.lLines[i].thisPoint.y) */
                }
            })
            IntermediateResult = []
            this.lLines.forEach((line, i) => {
                if (toDelete.indexOf(i) < 0)
                    IntermediateResult.push(line)
            })
            if (IntermediateResult.length > 0) {
                this.lLines = IntermediateResult
            }
        }
        if (this.hLines) {
            toDelete = []
            this.hLines.forEach((l, i) => {
                if (i > 0 && this.hLines[i].thisPoint && this.hLines[i - 1].thisPoint.y <= this.hLines[i].thisPoint.y || i > this.maxForks) {
                    toDelete.push(i)
                }
            })
            IntermediateResult = []
            this.hLines.forEach((line, i) => {
                if (toDelete.indexOf(i) < 0) {
                    IntermediateResult.push(line)
                }
            })
            if (IntermediateResult.length > 0) {
                this.hLines = IntermediateResult
            }
        }

        if (this.slidingMethod) {
            let hll = this.hLines.length
            let lll = this.lLines.length
            result = [
                this.hLines && hll > 0 && this.hLines[hll - 1] && this.hLines[hll - 1].thisPoint ? this.hLines[hll - 1].thisPoint.y : undefined,
                this.hLines && hll > 1 && this.hLines[hll - 2] && this.hLines[hll - 2].thisPoint ? this.hLines[hll - 2].thisPoint.y : undefined,
                this.hLines && hll > 2 && this.hLines[hll - 3] && this.hLines[hll - 3].thisPoint ? this.hLines[hll - 3].thisPoint.y : undefined,

                this.lLines && lll > 0 && this.lLines[lll - 1] && this.lLines[lll - 1].thisPoint ? this.lLines[lll - 1].thisPoint.y : undefined,
                this.lLines && lll > 1 && this.lLines[lll - 2] && this.lLines[lll - 2].thisPoint ? this.lLines[lll - 2].thisPoint.y : undefined,
                this.lLines && lll > 2 && this.lLines[lll - 3] && this.lLines[lll - 3].thisPoint ? this.lLines[lll - 3].thisPoint.y : undefined
            ]
        } else
            result = [
                this.hLines && this.hLines[0] && this.hLines[0].thisPoint ? this.hLines[0].thisPoint.y : undefined,
                this.hLines && this.hLines[1] && this.hLines[1].thisPoint ? this.hLines[1].thisPoint.y : undefined,
                this.hLines && this.hLines[2] && this.hLines[2].thisPoint ? this.hLines[2].thisPoint.y : undefined,

                this.lLines && this.lLines[0] && this.lLines[0].thisPoint ? this.lLines[0].thisPoint.y : undefined,
                this.lLines && this.lLines[1] && this.lLines[1].thisPoint ? this.lLines[1].thisPoint.y : undefined,
                this.lLines && this.lLines[2] && this.lLines[2].thisPoint ? this.lLines[2].thisPoint.y : undefined
            ];
        this.i++
        return result;
    }

}