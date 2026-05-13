import { withSpring, withTiming } from 'react-native-reanimated';

// Micro-interaction presets for buttons and cards
export const AnimationPresets = {
  // Button press animation
  pressScale: {
    pressed: 0.97,
    normal: 1,
    config: {
      damping: 15,
      stiffness: 150,
    },
  },

  // Fade animations
  fade: {
    in: {
      opacity: 1,
      duration: 200,
    },
    out: {
      opacity: 0,
      duration: 150,
    },
  },

  // Slide animations
  slide: {
    up: {
      translateY: -10,
      duration: 300,
    },
    down: {
      translateY: 10,
      duration: 300,
    },
  },
};

// Helper functions for common animations
export const animatePress = (scale: any) => {
  'worklet';
  scale.value = withSpring(AnimationPresets.pressScale.pressed, AnimationPresets.pressScale.config);
};

export const animateRelease = (scale: any) => {
  'worklet';
  scale.value = withSpring(AnimationPresets.pressScale.normal, AnimationPresets.pressScale.config);
};

export const fadeIn = (opacity: any, duration = 200) => {
  'worklet';
  opacity.value = withTiming(1, { duration });
};

export const fadeOut = (opacity: any, duration = 150) => {
  'worklet';
  opacity.value = withTiming(0, { duration });
};
