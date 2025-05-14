import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, ScrollView } from 'react-native';
import { Copy, Bookmark, BookmarkCheck, Volume2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Furi from '@btwnbrackets/react-native-furi';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import WebFurigana from './WebFurigana';

type TranslationCardProps = {
  english: string;
  japanese: string;
  furigana: Array<string | [string, string]>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopy?: () => void;
};

const TranslationCard = ({
  english,
  japanese,
  furigana,
  isFavorite,
  onToggleFavorite,
  onCopy,
}: TranslationCardProps) => {
  const { theme } = useTheme();
  const scaleAnim = new Animated.Value(0.98);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  const handleCopy = async () => {
    if (Platform.OS !== 'web') {
      await Clipboard.setStringAsync(japanese);
    } else {
      // Web fallback for clipboard
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(japanese);
        }
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
    onCopy?.();
  };

  const handleSpeak = () => {
    if (Platform.OS !== 'web') {
      Speech.speak(japanese, { language: 'ja-JP' });
    } else {
      // Web fallback for speech
      try {
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(japanese);
          utterance.lang = 'ja-JP';
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Speech synthesis error:', error);
      }
    }
  };

  const isWeb = Platform.OS === 'web';
  
  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.card,
    borderColor: theme.border,
    marginTop: isWeb ? 4 : 8,
    marginBottom: isWeb ? 8 : 12,
    ...(isWeb ? {} : theme.shadow.medium),
  };

  return (
    <Animated.View 
      style={[
        cardStyle, 
        Platform.OS !== 'web' 
          ? { transform: [{ scale: scaleAnim }] } 
          : { opacity: 1 } // No transform on web to avoid flickering
      ]}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.englishText, { color: theme.text, fontFamily: theme.typography.fontFamily.english.regular }]}>
            {english}
          </Text>
          
          <View style={isWeb ? styles.japaneseContainerWeb : styles.japaneseContainer}>
            {!isWeb ? (
              <Furi
                text={furigana}
                style={{
                  fontSize: theme.typography.fontSize.xxl,
                  fontFamily: theme.typography.fontFamily.japanese.medium,
                  color: theme.colors.primary[600],
                  lineHeight: theme.typography.fontSize.xxl * 1.5,
                }}
                rubyStyle={{
                  fontSize: theme.typography.fontSize.xs,
                  fontFamily: theme.typography.fontFamily.japanese.regular,
                  color: theme.colors.secondary[500],
                  lineHeight: theme.typography.fontSize.xs * 1.5,
                }}
              />
            ) : (
              <WebFurigana
                furigana={furigana}
                style={{
                  fontSize: theme.typography.fontSize.xxl,
                  fontFamily: theme.typography.fontFamily.japanese.medium,
                  color: theme.colors.primary[600],
                  lineHeight: theme.typography.fontSize.xxl * 1.2,
                }}
                rubyStyle={{
                  fontSize: theme.typography.fontSize.xs,
                  fontFamily: theme.typography.fontFamily.japanese.regular,
                  color: theme.colors.secondary[500],
                  lineHeight: 1,
                }}
              />
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleCopy}
              accessibilityLabel="Copy translation"
            >
              <Copy size={18} color={theme.colors.neutral[500]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSpeak}
              accessibilityLabel="Pronounce translation"
            >
              <Volume2 size={18} color={theme.colors.neutral[500]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onToggleFavorite}
              accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <BookmarkCheck size={18} color={theme.colors.secondary[500]} />
              ) : (
                <Bookmark size={18} color={theme.colors.neutral[500]} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: 'hidden',
    maxHeight: 300, // Limit height to enable scrolling for long content
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardContent: {
    padding: Platform.OS === 'web' ? 12 : 16,
  },
  englishText: {
    fontSize: 16,
    marginBottom: 12,
  },
  japaneseContainer: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  japaneseContainerWeb: {
    marginBottom: 2,
    paddingVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 4 : 0,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default TranslationCard;