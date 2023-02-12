import { LinesModel } from './lines.model'
import { LineDirective, Env } from './types'
import { TrendStateModel } from './trend.model'

export type { LinesModel, TrendStateModel, Env };
export class Indicator {
    public hLineDirectives: LineDirective[] = []
    public lLineDirectives: LineDirective[] = []
    public trend: TrendStateModel
    private lines: LinesModel
    private step: number = 1
    private i: number = 0
    public env: Env
    // Settings
    // Debug values
    timeCounter = 0
    consoleWindow: boolean
    minLog
    maxLog
    prevPoint: {
        x: number,
        l: number,
        h: number
    } = null
    /**
     *
     * @param pars type of Env
     */
    constructor(pars) {
        // Assign defaults
        this.env = Object.assign({
            step: 1,                // time step in minutes
            minLength: 5,
            minRightLeg: 3,
            maxForks: 500,
            minLog: 0,
            maxLog: 0,
            rollbackLength: 3,      // Устойчивый откат после пробоя линии тренда
            deltaModel: 1,
            minIsSizeOnRollback: 0.05,
            checkAfter: null,
            checkBefore: null,      // interval in minutes
            checkDelta: 20,         // Stop loss percent
            bounceAccuracy: null
        }, pars)
        this.env.zigZagMinTime = this.env.zigZagMinTime || 20
        this.env.minLength = Math.round(this.env.minLength / this.env.step) || 1
        this.env.minRightLeg = Math.round(this.env.minRightLeg / this.env.step) || 1
        this.env.rollbackLength = Math.round(this.env.rollbackLength / this.env.step) || 1
        this.env.forkDurationMin = Math.round(this.env.forkDurationMin / this.env.step) || 1
        if (this.env.checkAfter != null) {
            this.env.checkAfter = Math.round(this.env.checkAfter / this.env.step) || 1
            this.env.checkBefore = Math.round(this.env.checkBefore / this.env.step) || 1
        }
        this.env.forkDurationMax = Math.round(this.env.forkDurationMax / this.env.step) || 1
        this.lines = new LinesModel(this.step, this.env)
        this.trend = new TrendStateModel(this.lines, this.env)
    }

    /**
    * Log the data parameter during this.env.minLog and this.env.maxLog
    * @param Title - custom title of the data
    * @param data - data hash to log to terminal
    */
    log(title, ...data) {
        this.consoleWindow = this.env.minLog < this.timeCounter && this.timeCounter < this.env.maxLog
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
    nextValue(o: number, c: number, h: number, l: number, v: number) {
        // TODO Rise sensitivity
        // if (o > c) [o, h] = [h,o]
        this.timeCounter++
        // Apply line directives got on prevues step
        if (this.lLineDirectives.length > 0) {
            // TODO Fork only last line in Array
            this.lLineDirectives.forEach((d, i) => {
                let theLine = this.lines.id[d.lineIndex]
                if (d.condition == 'gt' && l > d.value && d.action == 'fork') {
                    if (theLine) {
                        if (d.lineIndex != undefined && theLine != undefined && theLine.k < 0)
                            this.lines.add(null, l, this.i - 1, this.prevPoint, d.lineIndex) // New extremum found
                        else {
                            theLine.forks.add(theLine.thisPoint.x, theLine.thisPoint.y)
                            this.lines.add(null, l, this.i - 1, this.prevPoint)
                        }
                    }
                }
            })
        }
        if (this.hLineDirectives.length > 0) {
            this.hLineDirectives.forEach((d, i) => {
                let theLine = this.lines.id[d.lineIndex]
                if (d.condition == 'lt' && h < d.value && d.action == 'fork') {
                    if (theLine) {
                        if (theLine.k > 0)
                            // New extremum found
                            this.lines.add(h, null, this.i - 1, this.prevPoint, d.lineIndex)
                        else {
                            theLine.forks.add(theLine.thisPoint.x, theLine.thisPoint.y)
                            this.lines.add(h, null, this.i - 1, this.prevPoint)
                        }
                    }
                }
            })
        }
        // Update lines and get future directives
        this.hLineDirectives.length = 0
        this.lLineDirectives.length = 0
        if (this.lines.list[0].length < 1) {
            this.lines.add(h, null, this.i)
            this.lines.add(null, l, this.i)
        } else {
            let updated
            this.lines.list.forEach(ofLines =>
                ofLines.forEach(lineID => {
                    let theLine = this.lines.id[lineID]
                    if (theLine && theLine.type) {
                        updated = null
                        if (theLine && theLine.startPoint.x < this.i) // Skip the case if line was just created. TODO make it gracefully
                            updated = this.lines.update(lineID, h, l, this.i)
                        let type = theLine.type
                        if (updated)
                            type == 'h' ? this.hLineDirectives.push(updated) : this.lLineDirectives.push(updated)
                    }
                })
            )
        }

        // Delete passed lines
        this.lines.list.forEach(ofLines => {
            let toDelete = []
            if (ofLines) {
                ofLines.forEach((lineID, i) => {
                    let thisLine = this.lines.id[ofLines[i]]
                    let prevLine = this.lines.id[ofLines[i - 1]]
                    if (
                        (i > 0 && thisLine && prevLine && thisLine.type == 'h' && thisLine.thisPoint && prevLine.thisPoint.y <= thisLine.thisPoint.y || i > this.env.maxForks) ||
                        (i > 0 && thisLine && prevLine && thisLine.type == 'l' && thisLine.thisPoint && prevLine.thisPoint.y >= thisLine.thisPoint.y || i > this.env.maxForks)
                    ) {
                        toDelete.push(lineID)
                    }
                })
                toDelete.forEach(lineID => this.lines.delete(lineID))
            }
        })
        this.prevPoint = {
            x: this.i,
            h: h,
            l: l
        }
        // Estimate trend
        this.trend.update(this.lines.list[0], this.lines.list[1])
        this.i++

        return this.lines;
    }

}
