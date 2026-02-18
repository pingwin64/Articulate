import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../lib/store/settings';

// ─── Types ────────────────────────────────────────────────────

export interface SpotlightTarget {
  key: string;
  ref: React.RefObject<View | null>;
  title: string;
  description: string;
  tooltipPosition: 'above' | 'below';
  padding?: number;
  borderRadius?: number;
}

interface SpotlightGuideProps {
  visible: boolean;
  targets: SpotlightTarget[];
  onComplete: () => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  scrollOffsetRef?: React.MutableRefObject<number>;
}

// ─── SVG Path Builder ─────────────────────────────────────────

function buildCutoutPath(
  screenW: number,
  screenH: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const cr = Math.min(r, w / 2, h / 2);
  const outer = `M0,0 H${screenW} V${screenH} H0 Z`;
  const inner = [
    `M${x + cr},${y}`,
    `H${x + w - cr}`,
    `A${cr},${cr} 0 0 1 ${x + w},${y + cr}`,
    `V${y + h - cr}`,
    `A${cr},${cr} 0 0 1 ${x + w - cr},${y + h}`,
    `H${x + cr}`,
    `A${cr},${cr} 0 0 1 ${x},${y + h - cr}`,
    `V${y + cr}`,
    `A${cr},${cr} 0 0 1 ${x + cr},${y}`,
    'Z',
  ].join(' ');
  return `${outer} ${inner}`;
}

// ─── Measure Helper ───────────────────────────────────────────

interface Rect { x: number; y: number; width: number; height: number }

function measureRef(ref: React.RefObject<View | null>): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!ref.current) { resolve(null); return; }
    let attempts = 0;
    const tryMeasure = () => {
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          resolve({ x, y, width, height });
        } else if (attempts < 5) {
          attempts++;
          setTimeout(tryMeasure, 80);
        } else {
          resolve(null);
        }
      });
    };
    tryMeasure();
  });
}

// ─── Constants ────────────────────────────────────────────────

const TOOLTIP_HEIGHT_ESTIMATE = 200;
const TOOLTIP_GAP = 16;
const SCREEN_TOP_MARGIN = 60;
const SCREEN_BOTTOM_MARGIN = 40;

// ─── Component ────────────────────────────────────────────────

export function SpotlightGuide({
  visible,
  targets,
  onComplete,
  scrollViewRef,
  scrollOffsetRef,
}: SpotlightGuideProps) {
  const { colors, glass, isDark } = useTheme();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const [stepIndex, setStepIndex] = useState(0);
  const [cutoutRect, setCutoutRect] = useState<Rect | null>(null);
  const [tooltipReady, setTooltipReady] = useState(false);

  const overlayOpacity = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);
  const tooltipTranslateY = useSharedValue(8);

  const screenW = Dimensions.get('window').width;
  const screenH = Dimensions.get('window').height;

  // ─── Single measure + auto-scroll (no double measurement) ──
  const measureAndScroll = useCallback(async (target: SpotlightTarget): Promise<Rect | null> => {
    // First measurement — get current screen position
    let rect = await measureRef(target.ref);
    if (!rect) return null;

    // Check if scroll is needed
    if (scrollViewRef?.current && scrollOffsetRef) {
      const pad = target.padding ?? 0;
      const visibleBottom = screenH - SCREEN_BOTTOM_MARGIN;

      let neededTop: number;
      let neededBottom: number;

      if (target.tooltipPosition === 'above') {
        neededTop = rect.y - pad - TOOLTIP_HEIGHT_ESTIMATE - TOOLTIP_GAP - 20;
        neededBottom = rect.y + rect.height + pad + 20;
      } else {
        neededTop = rect.y - pad - 20;
        neededBottom = rect.y + rect.height + pad + TOOLTIP_HEIGHT_ESTIMATE + TOOLTIP_GAP + 20;
      }

      let scrollDelta = 0;
      if (neededBottom > visibleBottom) {
        scrollDelta = neededBottom - visibleBottom;
      } else if (neededTop < SCREEN_TOP_MARGIN) {
        scrollDelta = neededTop - SCREEN_TOP_MARGIN;
      }

      if (Math.abs(scrollDelta) > 10) {
        const newOffset = Math.max(0, scrollOffsetRef.current + scrollDelta);
        scrollViewRef.current.scrollTo({ y: newOffset, animated: true });
        await new Promise((r) => setTimeout(r, 400));
        // Re-measure only if we actually scrolled
        rect = await measureRef(target.ref);
        if (!rect) return null;
      }
    }

    // Apply padding to get cutout rect
    const padding = target.padding ?? 0;
    return {
      x: rect.x - padding,
      y: rect.y - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  }, [scrollViewRef, scrollOffsetRef, screenH]);

  // ─── Reveal a step (measure → set cutout → show tooltip) ──
  const revealStep = useCallback(async (index: number) => {
    if (index >= targets.length) return;

    const rect = await measureAndScroll(targets[index]);
    if (rect) {
      setCutoutRect(rect);
      // Let React commit the cutout before fading in tooltip
      requestAnimationFrame(() => {
        setTooltipReady(true);
        const dur = reduceMotion ? 0 : 200;
        tooltipOpacity.value = withTiming(1, { duration: dur });
        tooltipTranslateY.value = withTiming(0, { duration: dur });
      });
    }
  }, [targets, measureAndScroll, reduceMotion, tooltipOpacity, tooltipTranslateY]);

  // ─── Initial mount ─────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    // Scroll to top for clean starting position
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }

    overlayOpacity.value = withTiming(1, { duration: reduceMotion ? 0 : 200 });

    const timer = setTimeout(() => revealStep(0), 80);
    return () => clearTimeout(timer);
  }, [visible]);

  // ─── Handle "Continue" / "Got it" ─────────────────────────
  const handleContinue = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const nextIndex = stepIndex + 1;

    if (nextIndex >= targets.length) {
      const duration = reduceMotion ? 0 : 200;
      tooltipOpacity.value = withTiming(0, { duration: reduceMotion ? 0 : 120 });
      overlayOpacity.value = withTiming(0, { duration }, () => {
        runOnJS(onComplete)();
      });
      return;
    }

    // 1. Immediately clear cutout + hide tooltip (solid overlay — no stale hole)
    setTooltipReady(false);
    setCutoutRect(null);

    const fadeDur = reduceMotion ? 0 : 120;
    tooltipOpacity.value = withTiming(0, { duration: fadeDur });
    tooltipTranslateY.value = withTiming(8, { duration: fadeDur });

    // 2. After fade completes: advance step, measure new target, reveal
    setTimeout(() => {
      setStepIndex(nextIndex);
      revealStep(nextIndex);
    }, fadeDur);
  }, [stepIndex, targets.length, hapticEnabled, reduceMotion, revealStep, onComplete, tooltipOpacity, tooltipTranslateY, overlayOpacity]);

  // ─── Animated styles ──────────────────────────────────────
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: tooltipTranslateY.value }],
  }));

  if (!visible) return null;

  const currentTarget = targets[stepIndex];
  const isLastStep = stepIndex === targets.length - 1;

  // Build SVG path — solid overlay when no cutout
  const svgPath = cutoutRect
    ? buildCutoutPath(
        screenW, screenH,
        cutoutRect.x, cutoutRect.y, cutoutRect.width, cutoutRect.height,
        currentTarget?.borderRadius ?? 12,
      )
    : `M0,0 H${screenW} V${screenH} H0 Z`;

  // Tooltip positioning
  const tooltipWidth = Math.min(screenW * 0.85, 320);
  const tooltipLeft = (screenW - tooltipWidth) / 2;

  return (
    <Animated.View
      style={[styles.overlay, overlayAnimatedStyle]}
      pointerEvents="box-none"
    >
      {/* SVG cutout overlay — blocks all touches */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}}>
        <Svg width={screenW} height={screenH} style={StyleSheet.absoluteFill}>
          <Path d={svgPath} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
        </Svg>
      </Pressable>

      {/* Tooltip card */}
      {tooltipReady && cutoutRect && currentTarget && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              width: tooltipWidth,
              left: tooltipLeft,
              ...(currentTarget.tooltipPosition === 'above'
                ? { bottom: screenH - cutoutRect.y + TOOLTIP_GAP }
                : { top: cutoutRect.y + cutoutRect.height + TOOLTIP_GAP }),
              backgroundColor: isDark ? 'rgba(28,28,30,0.98)' : 'rgba(255,255,255,0.98)',
              borderColor: glass.border,
            },
            tooltipAnimatedStyle,
          ]}
          pointerEvents="auto"
        >
          <Text style={[styles.tooltipTitle, { color: colors.primary }]}>
            {currentTarget.title}
          </Text>
          <Text style={[styles.tooltipDescription, { color: colors.secondary }]}>
            {currentTarget.description}
          </Text>

          {/* Step dots */}
          <View style={styles.dotsRow}>
            {targets.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === stepIndex
                      ? colors.primary
                      : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                  },
                ]}
              />
            ))}
          </View>

          {/* Continue / Got it button */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.continueText, { color: colors.bg }]}>
              {isLastStep ? 'Got it' : 'Continue'}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 300,
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  tooltipDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  continueButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
