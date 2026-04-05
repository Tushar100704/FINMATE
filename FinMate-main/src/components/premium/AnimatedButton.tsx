import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  icon,
}: AnimatedButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const gradientColors: Record<string, [string, string]> = {
    primary: ['#1A9BFF', '#0077CC'],
    secondary: ['#00C369', '#009C54'],
    outline: ['transparent', 'transparent'],
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes: Record<string, TextStyle> = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  return (
    <MotiView
      animate={{
        scale: pressed ? 0.96 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 100,
      }}
      style={[styles.container, style]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled}
        activeOpacity={1}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradientColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            sizeStyles[size],
            variant === 'outline' && styles.outline,
            disabled && styles.disabled,
          ]}
        >
          {icon && <MotiView style={styles.icon}>{icon}</MotiView>}
          <Text
            style={[
              styles.text,
              textSizes[size],
              variant === 'outline' && styles.outlineText,
              disabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#1A9BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  touchable: {
    borderRadius: 16,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    gap: 8,
  },
  outline: {
    borderWidth: 2,
    borderColor: '#1A9BFF',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: '#1A9BFF',
  },
  disabledText: {
    color: '#A3A3B7',
  },
  icon: {
    marginRight: 4,
  },
});
