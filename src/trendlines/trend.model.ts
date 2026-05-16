import { LineEvent, LineDirective, Point, Env } from './types';
import { LineModel } from './line.model';
import { LinesModel } from './lines.model';

/**
 * Trend state Model
 * The trendModel object use Lines and lineDirectives to estimate current trend state
 */
export class TrendStateModel {
    env: Required<Env>;
    in: {
        // longer state
        state: null | 'unknown' | 'flat' | 'rise' | 'fall' | 'squeeze';
        lineIndex: number | null;
        line: LineModel | null;
        size?: number;
    };
    is: {
        // current state
        state: null | 'flat' | 'rise' | 'fall';
        lineIndex: number | null;
        line: LineModel | null;
        size?: number;
        start: {
            x: number;
            y: number;
        } | null;
    };
    was: {
        // previous state
        state: null | 'flat' | 'rise' | 'fall';
        lineIndex: number | null;
        line: LineModel | null;
        size?: number | null;
        success?: boolean;
    };
    width: number; // longer state trend width
    speed: number; // longer state trend speed
    at: number; // time ago of the prevues state
    duration: number; // duration of the trend
    kdiff: number[] = [];
    lines: LinesModel;
    constructor(lines: LinesModel, env: Required<Env>) {
        this.env = env;
        this.lines = lines;
        this.in = {
            state: null,
            lineIndex: null,
            line: null,
        };
        this.is = {
            state: null,
            lineIndex: null,
            line: null,
            start: null,
            size: 0,
        };
        this.was = {
            state: null,
            lineIndex: null,
            line: null,
            size: null,
        };
        this.width = 0;
        this.speed = 0;
        this.at = 0;
    }

    hlMaxDuration: LineModel | null; // Current longest resistance
    llMaxDuration: LineModel | null; // Current longest support

    update(hLinesIDs: number[], lLinesIDs: number[]) {
        //Wait for the first turn
        //Init
        // Search of the longest line begun from this.is
        // TODO longest is just the first in array of forked lines
        if (hLinesIDs.length > 1)
            this.hlMaxDuration = hLinesIDs
                .map((lineID) => this.lines.id[lineID])
                .filter((line) =>
                    this.is.line
                        ? line.forkedAt
                            ? line.forkedAt > this.is.line.startPoint.x
                            : line.rollback
                            ? line.rollback.lastForkTime > this.is.line.startPoint.x
                            : false
                        : true,
                )
                .reduce((prev, current) => {
                    return prev.length > current.length ? prev : current;
                }, this.lines.id[hLinesIDs[0]]);
        else this.hlMaxDuration = this.lines.id[hLinesIDs[0]];
        if (lLinesIDs.length > 1)
            this.llMaxDuration = lLinesIDs
                .map((lineID) => this.lines.id[lineID])
                .filter((line) =>
                    this.is.line
                        ? line.forkedAt
                            ? line.forkedAt > this.is.line.startPoint.x
                            : line.rollback
                            ? line.rollback.lastForkTime > this.is.line.startPoint.x
                            : false
                        : true,
                )
                .reduce((prev, current) => {
                    return prev.length > current.length ? prev : current;
                }, this.lines.id[lLinesIDs[0]]);
        else this.llMaxDuration = this.lines.id[lLinesIDs[0]];

        if (this.is.state == null && this.was.state == null) {
            // Take the minimum trend duration = 5 candles
            this.is.line =
                this.llMaxDuration &&
                this.llMaxDuration.length > this.env.minLength &&
                this.hlMaxDuration.length < this.env.minLength
                    ? this.llMaxDuration //hLines
                    : this.hlMaxDuration &&
                      this.hlMaxDuration.length > this.env.minLength &&
                      this.llMaxDuration.length < this.env.minLength
                    ? this.hlMaxDuration
                    : null;
            if (this.is.line) {
                this.is.lineIndex = this.is.line.index;
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise';
                this.is.start = this.is.line.candlePoint;
            }
        }

        if (this.is.state) {
            // Wait for any line good break
            this.is.size = Math.max(this.is.size ?? 0, Math.abs(this.is.start!.y - this.is.line!.candlePoint.y));
            let selectedLine: LineModel =
                this.lines.id[this.is.lineIndex!] || this.lines.id[this.is.line!.type == 'h' ? 0 : 1];
            let foundBreak: number | null = null;
            let delta: number | null = null;
            let prevLineID: number;
            let oppositeLines = this.lines.list[selectedLine.type == 'h' ? 1 : 0].filter(
                (id) => this.lines.id[id].forked && this.lines.id[id].thisPoint.x - (this.lines.id[id].forkedAt ?? 0) > 12,
            );
            let oppositeLineID =
                oppositeLines.length > 1 ? oppositeLines[1] : oppositeLines.length > 0 ? oppositeLines[0] : null;
            let oppositeLinesInsideTrend = oppositeLines.filter((id) => (this.lines.id[id].forkedAt ?? 0) > this.is.start!.x);
            if (selectedLine)
                this.lines.list[selectedLine.type == 'h' ? 0 : 1].forEach((lineID, index) => {
                    let theLine = this.lines.id[lineID];
                    // Trend change conditions
                    if (lineID >= selectedLine.index && theLine.rollback != null) {
                        // when break on inner lines
                        // Get distance from the last fork on previous or current line
                        prevLineID = this.lines.list[selectedLine.type == 'h' ? 0 : 1][index - 1];
                        const cond =
                            this.env.deltaModel == 1 && index > 1 && prevLineID && this.lines.id[prevLineID]
                                ? index > 1 && prevLineID && this.lines.id[prevLineID].lastForkY
                                : this.lines.id[lineID > 0 ? lineID - 1 : 0];
                        if (cond)
                            delta =
                                (this.lines.id[lineID > 1 ? prevLineID! : selectedLine.type == 'h' ? 0 : 1].lastForkY ?? 0) -
                                theLine.candlePoint.y;
                        else if (theLine.rollback) delta = (theLine.rollback.lastForkValue ?? 0) - theLine.candlePoint.y;
                        else delta = 0;
                        if (
                            (theLine.rollback.lastForkValue ?? 0) > 0 && // Only if break of forked line
                            // The line lasts more then this.env.minRightLeg
                            theLine.thisPoint.x - theLine.rollback.lastForkTime > this.env.minRightLeg &&
                            // TODO Maybe we should choose shortest and bounced line instead longest
                            (this.is.state == 'fall' ? this.llMaxDuration!.length > 1 : this.hlMaxDuration!.length > 1) && // Превышены граничные параметры
                            // - По предыдущему экстремуму. Пробита величина прошлого экстремума
                            ((selectedLine.type == 'h' ? delta < 0 : delta > 0) ||
                                // - По времени. текущая лития столкнулась с длительным пробоем
                                theLine.rollback.length > this.env.rollbackLength ||
                                //  - По амплитуде. Откат до установленной доли между ценой начала тренда и ценой от начала обратной линии
                                (((this.is.size ?? 0) * 2) / 3 > Math.abs(this.is.start!.y - this.is.line!.candlePoint.y) &&
                                    (this.is.size ?? 0) > this.is.line!.candlePoint.y * this.env.minIsSizeOnRollback &&
                                    oppositeLinesInsideTrend.length > 1) ||
                                (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > this.is.start!.y && this.lines.list[0].length == 1
                                    : theLine.candlePoint.y < this.is.start!.y && this.lines.list[1].length == 1)) && // сохраняются разрешенные диапазоны
                            // - предыдущее ветвление (экстремум) был в заданном диапазоне
                            ((theLine.candlePoint.x - theLine.rollback.lastForkTime > this.env.forkDurationMin &&
                                theLine.candlePoint.x - theLine.rollback.lastForkTime < this.env.forkDurationMax) ||
                                // - текущая цена вышла из тренда
                                (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > theLine.startPoint.y
                                    : theLine.candlePoint.y < theLine.startPoint.y) ||
                                (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > this.is.start!.y && this.lines.list[0].length == 1
                                    : theLine.candlePoint.y < this.is.start!.y && this.lines.list[1].length == 1))
                        )
                            foundBreak = lineID + 1;
                    }
                });
            if (foundBreak) {
                // Calculate and compare was and is
                this.in.size = (this.was.size || 0) + this.is.size;
                // Estimate in state
                const dif = this.lines.id[0].candlePoint.y - this.is.start!.y;
                const isSuccess = this.is.state == 'rise' ? dif >= 0 : dif < 0;
                if (this.was.size) this.in.state = this.was.size > this.is.size ? this.was.state : this.is.state;
                // Copy is to was
                this.was = { ...this.is };
                this.was.success = isSuccess;
                // Update is
                // if exists opposite line with length > ?5 && length < thisLine.length then createOrder
                this.is.line = this.is.state == 'fall' ? this.llMaxDuration : this.hlMaxDuration;
                if (this.is.line === null) {
                    return;
                }
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise';
                this.is.lineIndex = this.is.line.index;
                this.is.start = this.lines.id[0].candlePoint;
                this.is.size = 0;
            }
            //
        }

        return;
    }
}
