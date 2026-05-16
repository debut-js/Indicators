import { LineModel } from './line.model';
import { LinesModel } from './lines.model';
import { LineEvent, LineDirective, Point, Env } from './types';
import { TrendStateModel } from './trend.model';

export type { LinesModel, TrendStateModel, Env };
type ExtremumPoint = {
    x: number;
    l: number;
    h: number;
};

export class Indicator {
    public hLineDirectives: LineDirective[] = [];
    public lLineDirectives: LineDirective[] = [];
    public trend: TrendStateModel;
    private lines: LinesModel;
    private step: number = 1; // TODO operate in different time scale
    private i: number = 0;
    public env: Required<Env>;
    // Settings
    // Debug values
    localCounter = 0;
    consoleWindow: boolean;
    minLog;
    maxLog;
    prevPoint: ExtremumPoint | null = null;
    /**
     *
     * @param pars type of Env
     */
    constructor(pars: Partial<Env> = {}) {
        // Assign defaults
        this.env = Object.assign(
            {
                step: 1, // time step in minutes
                minLength: 5,
                minRightLeg: 3,
                maxForks: 500,
                minLog: 0,
                maxLog: 0,
                rollbackLength: 3, // Устойчивый откат после пробоя линии тренда
                deltaModel: 1,
                minIsSizeOnRollback: 0.05,
                forkDurationMin: 0,
                forkDurationMax: Infinity,
            },
            pars,
        );
        this.env.minLength = Math.round(this.env.minLength / this.env.step) || 1;
        this.env.minRightLeg = Math.round(this.env.minRightLeg / this.env.step) || 1;
        this.env.rollbackLength = Math.round(this.env.rollbackLength / this.env.step) || 1;
        this.env.forkDurationMin = Math.round(this.env.forkDurationMin / this.env.step) || 1;
        this.env.forkDurationMax = Math.round(this.env.forkDurationMax / this.env.step) || 1;
        this.lines = new LinesModel(this.step);
        this.trend = new TrendStateModel(this.lines, this.env);
    }

    log(title, ...data) {
        this.consoleWindow = this.env.minLog < this.localCounter && this.localCounter < this.env.maxLog;
        if (this.consoleWindow) console.log(title, ...data);
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
        this.localCounter++;

        // Apply line directives got on prevues step
        if (this.lLineDirectives.length > 0) {
            // TODO Fork only last line in Array
            this.lLineDirectives.forEach((d, i) => {
                let theLine = this.lines.id[d.lineIndex];
                if (d.condition == 'gt' && l > d.value && d.action == 'fork') {
                    if (theLine) {
                        if (d.lineIndex != undefined && theLine != undefined && theLine.k < 0)
                            this.lines.add(null, l, this.i - 1, this.prevPoint, d.lineIndex); // New extremum found
                        else {
                            theLine.forked = true;
                            theLine.forkedAt = theLine.thisPoint.x;
                            theLine.forkedValue = theLine.thisPoint.y;
                            this.lines.add(null, l, this.i - 1, this.prevPoint);
                        }
                    }
                }
            });
        }
        if (this.hLineDirectives.length > 0) {
            this.hLineDirectives.forEach((d, i) => {
                let theLine = this.lines.id[d.lineIndex];
                if (d.condition == 'lt' && h < d.value && d.action == 'fork') {
                    if (theLine) {
                        if (theLine.k > 0)
                            // New extremum found
                            this.lines.add(h, null, this.i - 1, this.prevPoint, d.lineIndex);
                        else {
                            theLine.forked = true;
                            theLine.forkedAt = theLine.thisPoint.x;
                            theLine.forkedValue = theLine.thisPoint.y;
                            this.lines.add(h, null, this.i - 1, this.prevPoint);
                        }
                    }
                }
            });
        }
        // Update lines and get future directives
        this.hLineDirectives.length = 0;
        this.lLineDirectives.length = 0;
        if (this.lines.list[0].length < 1) {
            this.lines.add(h, null, this.i);
            this.lines.add(null, l, this.i);
        } else {
            let updated;
            this.lines.list.forEach((ofLines) =>
                ofLines.forEach((lineID) => {
                    let theLine = this.lines.id[lineID];
                    if (theLine && theLine.type) {
                        updated = null;
                        if (theLine && theLine.startPoint.x < this.i)
                            // Skip the case if line was just created. TODO make it gracefully
                            updated = this.lines.update(lineID, h, l, this.i);
                        let type = theLine.type;
                        if (updated)
                            type == 'h' ? this.hLineDirectives.push(updated) : this.lLineDirectives.push(updated);
                    }
                }),
            );
        }

        //Delete passed lines
        let toDelete: number[] = [];
        this.lines.list.forEach((ofLines) => {
            if (ofLines) {
                toDelete = [];
                ofLines.forEach((lineID, i) => {
                    let thisLine = this.lines.id[ofLines[i]];
                    let prevLine = this.lines.id[ofLines[i - 1]];
                    if (
                        (i > 0 &&
                            thisLine &&
                            prevLine &&
                            thisLine.type == 'h' &&
                            thisLine.thisPoint &&
                            prevLine.thisPoint.y <= thisLine.thisPoint.y) ||
                        i > this.env.maxForks ||
                        (i > 0 &&
                            thisLine &&
                            prevLine &&
                            thisLine.type == 'l' &&
                            thisLine.thisPoint &&
                            prevLine.thisPoint.y >= thisLine.thisPoint.y) ||
                        i > this.env.maxForks
                    ) {
                        toDelete.push(lineID);
                    }
                });
                toDelete.forEach((lineID: number) => this.lines.delete(lineID));
            }
        });
        this.prevPoint = {
            x: this.i,
            h: h,
            l: l,
        };
        // Estimate trend
        this.trend.update(this.lines.list[0], this.lines.list[1]);
        this.i++;

        // Return result
        return this.lines;
    }
}
