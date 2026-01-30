import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';
import { GlassSegmentedControl } from './GlassSegmentedControl';

interface WPMChartProps {
  height?: number;
}

export function WPMChart({ height = 180 }: WPMChartProps) {
  const { colors, isDark } = useTheme();
  const { readingHistory, baselineWPM } = useSettingsStore();
  const [filterIndex, setFilterIndex] = useState(0);

  const filterOptions = ['7d', '30d', 'All'];

  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const sessions = [...readingHistory].reverse(); // oldest first

    if (filterIndex === 0) {
      const cutoff = now - 7 * 24 * 60 * 60 * 1000;
      return sessions.filter((s) => new Date(s.readAt).getTime() > cutoff);
    }
    if (filterIndex === 1) {
      const cutoff = now - 30 * 24 * 60 * 60 * 1000;
      return sessions.filter((s) => new Date(s.readAt).getTime() > cutoff);
    }
    return sessions;
  }, [readingHistory, filterIndex]);

  if (filteredSessions.length < 2) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.primary }]}>WPM Progress</Text>
          <GlassSegmentedControl
            options={filterOptions}
            selectedIndex={filterIndex}
            onSelect={setFilterIndex}
          />
        </View>
        <View style={[styles.emptyChart, { height }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Complete {2 - filteredSessions.length} more {filteredSessions.length === 1 ? 'session' : 'sessions'} to see your chart
          </Text>
        </View>
      </View>
    );
  }

  const wpmValues = filteredSessions.map((s) => s.wpm);
  const minWPM = Math.max(0, Math.min(...wpmValues) - 20);
  const maxWPM = Math.max(...wpmValues) + 20;
  const range = maxWPM - minWPM || 1;

  const chartWidth = 300;
  const chartHeight = height - 40;
  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 8;
  const paddingBottom = 24;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const points = filteredSessions.map((s, i) => {
    const x = paddingLeft + (i / (filteredSessions.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((s.wpm - minWPM) / range) * plotHeight;
    return { x, y, wpm: s.wpm };
  });

  // Build smooth path
  const pathData = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Area fill path
  const areaPath =
    pathData +
    ` L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  // Y-axis labels
  const yLabels = [minWPM, Math.round((minWPM + maxWPM) / 2), maxWPM];

  // X-axis date labels
  const firstDate = new Date(filteredSessions[0].readAt);
  const lastDate = new Date(filteredSessions[filteredSessions.length - 1].readAt);
  const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

  // Baseline line position
  const baselineY =
    baselineWPM && baselineWPM >= minWPM && baselineWPM <= maxWPM
      ? paddingTop + plotHeight - ((baselineWPM - minWPM) / range) * plotHeight
      : null;

  const lastPoint = points[points.length - 1];
  const lineColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.primary }]}>WPM Progress</Text>
        <GlassSegmentedControl
          options={filterOptions}
          selectedIndex={filterIndex}
          onSelect={setFilterIndex}
        />
      </View>
      <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={0.12} />
            <Stop offset="1" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={0.01} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((val, i) => {
          const y = paddingTop + plotHeight - ((val - minWPM) / range) * plotHeight;
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke={gridColor} strokeWidth={0.5} />
              <SvgText x={paddingLeft - 6} y={y + 4} fill={colors.muted} fontSize={10} textAnchor="end">
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis labels */}
        <SvgText x={paddingLeft} y={chartHeight - 4} fill={colors.muted} fontSize={10} textAnchor="start">
          {formatDate(firstDate)}
        </SvgText>
        <SvgText x={chartWidth - paddingRight} y={chartHeight - 4} fill={colors.muted} fontSize={10} textAnchor="end">
          {formatDate(lastDate)}
        </SvgText>

        {/* Baseline dashed line */}
        {baselineY !== null && (
          <Line
            x1={paddingLeft}
            y1={baselineY}
            x2={chartWidth - paddingRight}
            y2={baselineY}
            stroke={colors.info}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        )}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path d={pathData} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Latest data point */}
        <Circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill={colors.primary} />
        <Circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={colors.bg} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyChart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
