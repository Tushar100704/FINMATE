import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, ScrollViewProps, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Layout } from '../../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  scrollViewProps?: ScrollViewProps;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  horizontalPadding?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  scroll = false,
  scrollViewProps,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom'],
  horizontalPadding = true,
  keyboardAvoiding = false,
  backgroundColor = Colors.background,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingLeft: horizontalPadding ? Layout.screenPaddingHorizontal : 0,
    paddingRight: horizontalPadding ? Layout.screenPaddingHorizontal : 0,
  };

  const scrollContentStyle: ViewStyle = {
    flexGrow: 1,
    paddingBottom: edges.includes('bottom') ? insets.bottom + Layout.screenPaddingVertical : Layout.screenPaddingVertical,
    ...contentContainerStyle,
  };

  const content = scroll ? (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={scrollContentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[containerStyle, contentContainerStyle]}>
      {children}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} edges={edges}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
});
