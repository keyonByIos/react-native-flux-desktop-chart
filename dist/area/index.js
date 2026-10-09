"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaChart = AreaChart;
// Area：面积图。复用 Plot；各序列面积/折线/顶点/高亮环收集成纯数据 spec，交单张 CanvasLayer 命令式烘成闭合路径填充。
// 入场：沿 x 方向推进 revealX，面积与折线同步左→右生长（重烘 1 张图）；stack 时逐序列堆叠基线。
const react_1 = __importDefault(require("react"));
const react_native_flux_desktop_1 = require("react-native-flux-desktop");
const common_1 = require("../core/common");
const data_1 = require("../core/data");
const scale_1 = require("../core/scale");
const geometry_1 = require("../core/geometry");
const canvas_layer_1 = require("../core/canvas-layer");
const theme_1 = require("../core/theme");
function truncateToX(pts, x) {
    if (pts.length === 0)
        return [];
    const out = [];
    for (let i = 0; i < pts.length; i++) {
        if (pts[i][0] <= x)
            out.push(pts[i]);
        else {
            if (i > 0) {
                const a = pts[i - 1];
                const b = pts[i];
                const r = b[0] - a[0] ? (x - a[0]) / (b[0] - a[0]) : 0;
                out.push([x, a[1] + (b[1] - a[1]) * r]);
            }
            break;
        }
    }
    return out;
}
function AreaChart(props) {
    const theme = (0, common_1.useChartTheme)();
    const { data, xField, yField, seriesField, color, height = 260, width, stack = false, fillOpacity = '55', gradient = false, smooth = false, point = false, label = false, legend = true, tooltip = true, animation = true, animateDuration = 1000, yAxisFormatter = scale_1.compactNumber, xAxisFormatter, grid, referenceLine, style, } = props;
    const [measured, onLayout] = (0, common_1.useMeasuredWidth)(width ?? 520);
    const w = width ?? measured;
    const p = (0, common_1.useEnter)(animation, animateDuration);
    const prep = (0, data_1.prepare)(data, xField, yField, seriesField);
    const { isHidden, toggle, active } = (0, common_1.useLegendToggle)(prep.series.length);
    const n = prep.categories.length;
    // 堆叠：仅累加「可见序列」（隐藏序列不参与堆叠与 yMax）
    const lower = [];
    const upper = [];
    let acc = new Array(n).fill(0);
    prep.series.forEach((s, si) => {
        if (isHidden(si)) {
            lower.push([]);
            upper.push([]);
            return;
        }
        const lo = [];
        const up = [];
        s.points.forEach((v, i) => {
            const val = v ?? 0;
            lo.push(stack ? acc[i] : 0);
            up.push(stack ? acc[i] + val : val);
            if (stack)
                acc[i] += val;
        });
        lower.push(lo);
        upper.push(up);
    });
    const visSeries = [];
    prep.series.forEach((s, si) => {
        if (!isHidden(si))
            visSeries.push({ s, si });
    });
    const allVals = stack ? prep.categories.map((_, i) => acc[i]) : visSeries.flatMap(({ s }) => s.points.map((v) => v ?? 0));
    const { niceMax, ticks } = (0, scale_1.niceTicks)(Math.max(...allVals, (referenceLine ?? []).reduce((m, r) => Math.max(m, r.value), 0), 1));
    const legendItems = prep.series.map((s, i) => ({ name: s.name, color: (0, theme_1.seriesColor)(i, color, theme) }));
    return (react_1.default.createElement(react_native_flux_desktop_1.View, { style: [{ gap: theme.labelSize }, style], onLayout: onLayout },
        react_1.default.createElement(common_1.Plot, { width: w, height: height, categories: prep.categories, yTicks: ticks, yMax: niceMax, yFormatter: yAxisFormatter, xFormatter: xAxisFormatter, grid: grid, interactive: tooltip, tooltipFor: (i) => ({ title: prep.categories[i], rows: visSeries.map(({ s, si }) => ({ name: s.name, color: (0, theme_1.seriesColor)(si, color, theme), value: s.points[i] == null ? '—' : yAxisFormatter(s.points[i]) })) }) }, (ctx) => {
            const revealX = ctx.padL + ctx.plotW * p;
            const spec = [];
            const labelNodes = [];
            prep.series.forEach((_s, si) => {
                if (isHidden(si))
                    return;
                const col = (0, theme_1.seriesColor)(si, color, theme);
                const topPts = upper[si].map((v, i) => [ctx.xAt(i), ctx.yAt(v)]);
                const botPts = lower[si].map((v, i) => [ctx.xAt(i), ctx.yAt(v)]);
                // 平滑：先把上/下边界稠密成过点曲线，再按揭示前沿截断→面积随曲线生长
                const shownTop = truncateToX(smooth ? (0, geometry_1.catmullRom)(topPts) : topPts, revealX);
                const shownBot = truncateToX(smooth ? (0, geometry_1.catmullRom)(botPts) : botPts, revealX);
                // 数据点标记：仅取已揭示（x ≤ 前沿）的上边界点
                const dots = point
                    ? topPts.filter((pt) => pt[0] <= revealX + 0.5).map((pt) => [pt[0], pt[1]])
                    : [];
                // 悬浮高亮：当前类目上边界点中心
                let hl = null;
                if (ctx.activeIndex != null) {
                    const ai = ctx.activeIndex;
                    hl = [ctx.xAt(ai), ctx.yAt(upper[si][ai])];
                }
                // 数据标签：仍用 Text 节点保字形清晰（数量受类目约束）
                if (label) {
                    prep.series[si].points.forEach((v, i) => {
                        if (v == null)
                            return;
                        const px = ctx.xAt(i);
                        if (px > revealX + 0.5)
                            return;
                        labelNodes.push(react_1.default.createElement(react_native_flux_desktop_1.Text, { key: `al${si}-${i}`, numberOfLines: 1, style: { position: 'absolute', left: px - 40, top: ctx.yAt(upper[si][i]) - theme.labelSize - 7, width: 80, textAlign: 'center', fontSize: theme.labelSize, color: col, fontWeight: '600', opacity: p } }, yAxisFormatter(v)));
                    });
                }
                spec.push({
                    col,
                    top: shownTop.map((pt) => [pt[0], pt[1]]),
                    bot: shownBot.map((pt) => [pt[0], pt[1]]),
                    dots,
                    hl,
                    gradient,
                    fillAlpha: parseInt(fillOpacity, 16) / 255,
                });
            });
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(canvas_layer_1.CanvasLayer, { width: w, height: height, deps: [w, height, smooth, p, JSON.stringify(spec), fillOpacity], draw: (c) => {
                        for (const sp of spec) {
                            if (sp.top.length < 2)
                                continue;
                            const rgb = (0, theme_1.parseHex)(sp.col);
                            // 面积闭合多边形：上边界正序 → 下边界逆序 → 回拢
                            c.beginPath();
                            c.moveTo(sp.top[0][0], sp.top[0][1]);
                            for (let i = 1; i < sp.top.length; i++)
                                c.lineTo(sp.top[i][0], sp.top[i][1]);
                            for (let i = sp.bot.length - 1; i >= 0; i--)
                                c.lineTo(sp.bot[i][0], sp.bot[i][1]);
                            c.closePath();
                            if (sp.gradient && rgb) {
                                const ys = sp.top.concat(sp.bot).map((pt) => pt[1]);
                                const g = c.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
                                g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${sp.fillAlpha})`);
                                g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
                                c.fillStyle = g;
                            }
                            else {
                                c.fillStyle = (0, theme_1.withAlpha)(sp.col, fillOpacity);
                            }
                            c.globalAlpha = p;
                            c.fill();
                            c.globalAlpha = 1;
                            // 上边界折线
                            c.beginPath();
                            c.moveTo(sp.top[0][0], sp.top[0][1]);
                            for (let i = 1; i < sp.top.length; i++)
                                c.lineTo(sp.top[i][0], sp.top[i][1]);
                            c.strokeStyle = sp.col;
                            c.lineWidth = 2;
                            c.lineJoin = 'round';
                            c.lineCap = 'round';
                            c.stroke();
                            // 顶点
                            if (sp.dots.length) {
                                c.globalAlpha = p;
                                for (const dp of sp.dots) {
                                    c.beginPath();
                                    c.arc(dp[0], dp[1], 3, 0, Math.PI * 2);
                                    c.fillStyle = sp.col;
                                    c.fill();
                                }
                                c.globalAlpha = 1;
                            }
                            // 悬浮高亮环
                            if (sp.hl) {
                                c.beginPath();
                                c.arc(sp.hl[0], sp.hl[1], 5, 0, Math.PI * 2);
                                c.fillStyle = '#ffffff';
                                c.fill();
                                c.lineWidth = 2;
                                c.strokeStyle = sp.col;
                                c.stroke();
                            }
                        }
                    } }),
                labelNodes,
                referenceLine && referenceLine.length ? react_1.default.createElement(common_1.ReferenceLines, { key: "ref", lines: referenceLine, ctx: ctx, theme: theme, formatter: yAxisFormatter }) : null));
        }),
        legend && prep.series.length > 1 ? react_1.default.createElement(common_1.ChartLegend, { items: legendItems, active: active, onToggleIndex: toggle }) : null));
}
exports.default = AreaChart;
