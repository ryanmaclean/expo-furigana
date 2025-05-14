import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

type SettingsItemProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  type?: 'link' | 'switch';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
};

const SettingsItem = ({
  title,
  description,
  icon,
  onPress,
  type = 'link',
  value,
  onValueChange,
}: SettingsItemProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomColor: theme.border,
        },
      ]}
      onPress={onPress}
      disabled={type === 'switch' || !onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
              fontFamily: theme.typography.fontFamily.english.medium,
            },
          ]}
        >
          {title}
        </Text>
        
        {description && (
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.english.regular,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      
      {type === 'link' && onPress && (
        <ChevronRight size={20} color={theme.colors.neutral[400]} />
      )}
      
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: theme.colors.neutral[300],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.colors.white}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
});

export default SettingsItem;