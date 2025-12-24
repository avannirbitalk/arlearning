import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, scroll = true, style }) => {
  const Container = scroll ? ScrollView : SafeAreaView;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Container
        contentContainerStyle={scroll ? [styles.container, style] : undefined}
        style={!scroll ? [styles.container, style] : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
});
