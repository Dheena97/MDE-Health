import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart, GaugeChart, RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComponent as RadarComp } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, BarChart, LineChart, GaugeChart, RadarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComp, CanvasRenderer]);

export { echarts, ReactEChartsCore };

// ─── Health Donut Chart ────────────────────────────
export function HealthDonutChart({ healthy, warning, critical }: { healthy: number; warning: number; critical: number }) {
  const total = healthy + warning + critical;
  const option = {
    tooltip: { trigger: 'item', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 3 },
      label: {
        show: true, position: 'center', fontSize: 28, fontWeight: 'bold', color: '#e2e8f0',
        formatter: () => `${total}`,
      },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' },
      },
      data: [
        { value: healthy, name: 'Healthy', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: '#059669' }]) } },
        { value: warning, name: 'Warning', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fbbf24' }, { offset: 1, color: '#d97706' }]) } },
        { value: critical, name: 'Critical', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#f87171' }, { offset: 1, color: '#dc2626' }]) } },
      ].filter(d => d.value > 0),
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (_idx: number) => Math.random() * 200,
    }],
  };
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height: 280 }} />;
}

// ─── Health Gauge Chart ────────────────────────────
export function HealthGaugeChart({ score }: { score: number }) {
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      splitNumber: 10,
      pointer: { show: true, length: '60%', width: 4, itemStyle: { color } },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[0.3, '#ef4444'], [0.7, '#f59e0b'], [0.9, '#10b981'], [1, '#059669']],
        },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { show: true, offsetCenter: [0, '70%'], fontSize: 12, color: '#94a3b8' },
      detail: {
        valueAnimation: true, fontSize: 32, fontWeight: 'bold', color,
        offsetCenter: [0, '40%'], formatter: '{value}%',
      },
      data: [{ value: score, name: 'Health Score' }],
      animationDuration: 1500,
      animationEasing: 'bounceOut',
    }],
  };
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height: 250 }} />;
}

// ─── Category Bar Chart ────────────────────────────
export function CategoryBarChart({ data }: { data: { category: string; healthy: number; warning: number; critical: number }[] }) {
  const categories = data.map(d => d.category.replace('MDE ', '').replace('Defender ', ''));
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
    grid: { left: 8, right: 20, bottom: 0, top: 10, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#64748b', fontSize: 11 }, splitLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: { type: 'category', data: categories, axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [
      {
        name: 'Healthy', type: 'bar', stack: 'total', data: data.map(d => d.healthy),
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#059669' }, { offset: 1, color: '#34d399' }]), borderRadius: [0, 0, 0, 0] },
        barWidth: 18,
      },
      {
        name: 'Warning', type: 'bar', stack: 'total', data: data.map(d => d.warning),
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#d97706' }, { offset: 1, color: '#fbbf24' }]) },
      },
      {
        name: 'Critical', type: 'bar', stack: 'total', data: data.map(d => d.critical),
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#dc2626' }, { offset: 1, color: '#f87171' }]), borderRadius: [0, 4, 4, 0] },
      },
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height: Math.max(250, data.length * 40) }} />;
}

// ─── Compliance Radar Chart ────────────────────────
export function ComplianceRadarChart({ data }: { data: { category: string; score: number }[] }) {
  const option = {
    radar: {
      indicator: data.map(d => ({ name: d.category.replace('MDE ', '').replace('Defender ', ''), max: 100 })),
      shape: 'polygon',
      axisName: { color: '#94a3b8', fontSize: 11 },
      splitArea: { areaStyle: { color: ['rgba(99, 102, 241, 0.02)', 'rgba(99, 102, 241, 0.05)'] } },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: data.map(d => d.score),
        name: 'Compliance',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.05)' },
          ]),
        },
        lineStyle: { color: '#6366f1', width: 2 },
        itemStyle: { color: '#818cf8' },
      }],
      animationDuration: 1500,
    }],
    tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  };
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height: 300 }} />;
}
