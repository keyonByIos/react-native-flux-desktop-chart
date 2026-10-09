# react-native-flux-desktop-chart（中文文档）

> 📊 纯 React 桌面渲染栈的图表组件族 —— 自绘管线、内置入场动画。

![版本](https://img.shields.io/badge/version-0.1.0-blue) ![许可证](https://img.shields.io/badge/license-MIT-green) ![运行时](https://img.shields.io/badge/%E7%BA%AFReact%C2%B7%E5%8E%9F%E7%94%9F%E5%83%8F%E7%B4%A0%C2%B7%E9%9D%9EElectron-ff69b4)

**依赖：** `react-native-flux-desktop`（UI 核心）· `react`

---

![折线图](./assets/line.png)

本包提供 **40+ 种图表**，覆盖基础、高阶、金融与关系图四大门类，全部对齐 `@ant-design/charts` 的数据模型，在原生像素管线上自绘，并带真实窗口标题栏——**非 Electron、非 DOM `<canvas>`**。图表自带入场动画（描线、生长、淡入等），主题色随 Token 联动。

| 折线图 Line | K 线图 Candlestick | 环形树图 Sunburst |
| :---: | :---: | :---: |
| ![](./assets/line.png) | ![](./assets/candlestick.png) | ![](./assets/sunburst.png) |

## 安装

```bash
npm install react-native-flux-desktop        # peer：UI 核心（必需）
npm install react-native-flux-desktop-chart
```

## 用法

```tsx
import { LineChart } from 'react-native-flux-desktop-chart';

const data = [
  { month: '1月', value: 320 },
  { month: '2月', value: 410 },
  { month: '3月', value: 380 },
  { month: '4月', value: 520 },
];

export default () => <LineChart data={data} xField="month" yField="value" height={280} />;
```

## 组件清单

**基础图表** — `LineChart` 折线 · `AreaChart` 面积 · `ColumnChart` 柱状 · `BarChart` 条形 · `PieChart` 饼图 · `RadarChart` 雷达 · `GaugeChart` 仪表盘 · `ScatterChart` 散点 · `RoseChart` 玫瑰 · `FunnelChart` 漏斗 · `WaterfallChart` 瀑布流 · `HeatmapChart` 热力图

**高阶图表** — `TreemapChart` 矩形树图 · `SunburstChart` 环形树图 · `SankeyChart` 桑基图 · `BoxPlotChart` 箱线图 · `HistogramChart` 直方图 · `ViolinChart` 小提琴图 · `RangeBarChart` 区间条 · `RadialBarChart` 径向条 · `BulletChart` 子弹图 · `CalendarHeatmapChart` 日历热力 · `ComboChart` 组合图 · `SparklineChart` 迷你图

**金融图表** — `CandlestickChart` K 线 · `TimeSharingChart` 分时 · `IndicatorChart` 指标 · `DepthChart` 盘口深度

**关系图** — `DendrogramChart` 生态树 · `DendrogrCompactChart` 紧凑树 · `IndentedTree` 缩进树 · `FlowChart` 流程图 · `MindMapChart` 思维导图 · `OrgChart` 组织架构

**工具** — `movingAverage` 移动平均 · `sma / ema / macd / rsi / kdj / bollinger` 技术指标 · `ChartLegend` 图例 · `ReferenceLines` 参考线 · `GridLines` 网格 · `useMeasuredWidth` 宽度测量 · `DEFAULT_PALETTE` 默认调色板

## 说明

- 本包是 UI 核心的 *peer*：核心提供渲染器、主题 Token 与原生窗口，图表组件请仅从本包根入口导入。
- 金融图表内置常用技术指标（MACD/RSI/KDJ/BOLL 等），无需额外依赖即可叠加副图。
- 关系图为纯布局 + 自绘，支持水平 / 垂直 / 径向多种排布。

## 许可证

MIT

> English 版见 [README.md](./README.md)。
