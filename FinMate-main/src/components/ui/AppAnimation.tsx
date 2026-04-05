import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface AppAnimationProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
  width?: number;
  height?: number;
  onAnimationFinish?: () => void;
  resizeMode?: 'cover' | 'contain' | 'center';
}

export function AppAnimation({
  source,
  autoPlay = true,
  loop = false,
  speed = 1,
  style,
  width,
  height,
  onAnimationFinish,
  resizeMode = 'contain',
}: AppAnimationProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  const containerStyle: ViewStyle = {
    width: width || 100,
    height: height || 100,
    ...style,
  };

  return (
    <View style={containerStyle}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
        resizeMode={resizeMode}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: '100%',
    height: '100%',
  },
});
