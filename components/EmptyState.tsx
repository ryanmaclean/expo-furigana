import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen, History, Bookmark, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

type EmptyStateProps = {
  type: 'translation' | 'history' | 'favorites' | 'error';
  message?: string;
};

const EmptyState = ({ type, message }: EmptyStateProps) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'translation':
        return <BookOpen size={60} color={theme.colors.primary[300]} />;
      case 'history':
        return <History size={60} color={theme.colors.primary[300]} />;
      case 'favorites':
        return <Bookmark size={60} color={theme.colors.primary[300]} />;
      case 'error':
        return <AlertCircle size={60} color={theme.colors.error[500]} />;
      default:
        return <BookOpen size={60} color={theme.colors.primary[300]} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'translation':
        return 'Enter some text to translate to Japanese';
      case 'history':
        return 'Your translation history will appear here';
      case 'favorites':
        return 'Bookmark translations to save them here';
      case 'error':
        return 'Something went wrong';
      default:
        return 'No content to display';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text
        style={[
          styles.message,
          {
            color: type === 'error' ? theme.colors.error[500] : theme.colors.neutral[500],
            fontFamily: theme.typography.fontFamily.english.medium,
          },
        ]}>
        {message || getDefaultMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.9,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default EmptyState;