import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { History, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Translation } from '@/types/Translation';

type TranslationHistoryItemProps = {
  item: Translation;
  onPress: () => void;
  onToggleFavorite: () => void;
};

const TranslationHistoryItem = ({
  item,
  onPress,
  onToggleFavorite,
}: TranslationHistoryItemProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          ...theme.shadow.small,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.englishText,
              {
                color: theme.text,
                fontFamily: theme.typography.fontFamily.english.regular,
              },
            ]}
            numberOfLines={1}
          >
            {item.english}
          </Text>
          <Text
            style={[
              styles.japaneseText,
              {
                color: theme.colors.primary[600],
                fontFamily: theme.typography.fontFamily.japanese.medium,
              },
            ]}
            numberOfLines={1}
          >
            {item.japanese}
          </Text>
        </View>

        <View style={styles.actions}>
          {item.timestamp ? (
            <View style={styles.timestamp}>
              <History size={12} color={theme.colors.neutral[400]} />
              <Text
                style={[
                  styles.timestampText,
                  {
                    color: theme.colors.neutral[400],
                    fontFamily: theme.typography.fontFamily.english.regular,
                  },
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ) : null}
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {item.isFavorite ? (
              <BookmarkCheck size={18} color={theme.colors.secondary[500]} />
            ) : (
              <Bookmark size={18} color={theme.colors.neutral[400]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'web' ? 8 : 12,
    borderWidth: 1,
  },
  content: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  englishText: {
    fontSize: 14,
    marginBottom: 4,
  },
  japaneseText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timestampText: {
    fontSize: 12,
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 4,
  },
});

export default TranslationHistoryItem;