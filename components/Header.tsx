import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  title: string;
  rightAction?: React.ReactNode;
};

const Header = ({ title, rightAction }: HeaderProps) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 10,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
            fontFamily: theme.typography.fontFamily.english.bold,
          },
        ]}
      >
        {title}
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun size={20} color={theme.colors.secondary[500]} />
          ) : (
            <Moon size={20} color={theme.colors.primary[500]} />
          )}
        </TouchableOpacity>
        
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    padding: 8,
  },
});

export default Header;