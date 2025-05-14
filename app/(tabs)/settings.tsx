import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import SettingsItem from '@/components/SettingsItem';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoonStar, Sun, Volume2, Trash2, Info, ExternalLink, FileQuestion } from 'lucide-react-native';

const HISTORY_STORAGE_KEY = '@translations_history';
const FAVORITES_STORAGE_KEY = '@translations_favorites';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [autoPlayPronunciation, setAutoPlayPronunciation] = useState(false);

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all translation history and favorites? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([HISTORY_STORAGE_KEY, FAVORITES_STORAGE_KEY]);
              Alert.alert('Success', 'All translation data has been cleared.');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open the link');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Header title="Settings" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.english.medium,
              },
            ]}
          >
            Appearance
          </Text>
          
          <SettingsItem
            title="Dark Mode"
            description="Switch between light and dark theme"
            icon={isDark ? <MoonStar size={22} color={theme.colors.primary[400]} /> : <Sun size={22} color={theme.colors.primary[400]} />}
            type="switch"
            value={isDark}
            onValueChange={toggleTheme}
          />
        </View>
        
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.english.medium,
              },
            ]}
          >
            Translation
          </Text>
          
          <SettingsItem
            title="Auto-Play Pronunciation"
            description="Automatically play audio after translation"
            icon={<Volume2 size={22} color={theme.colors.primary[400]} />}
            type="switch"
            value={autoPlayPronunciation}
            onValueChange={setAutoPlayPronunciation}
          />
        </View>
        
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.english.medium,
              },
            ]}
          >
            Data
          </Text>
          
          <SettingsItem
            title="Clear All Data"
            description="Delete all translation history and favorites"
            icon={<Trash2 size={22} color={theme.colors.error[500]} />}
            onPress={clearAllData}
          />
        </View>
        
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.english.medium,
              },
            ]}
          >
            About
          </Text>
          
          <SettingsItem
            title="About This App"
            description="Learn more about the Japanese Translation App"
            icon={<Info size={22} color={theme.colors.primary[400]} />}
            onPress={() => {}}
          />
          
          <SettingsItem
            title="Japanese Learning Resources"
            description="Useful websites for learning Japanese"
            icon={<ExternalLink size={22} color={theme.colors.primary[400]} />}
            onPress={() => openWebsite('https://www.tofugu.com/')}
          />
          
          <SettingsItem
            title="Help & Support"
            description="Get help with using the app"
            icon={<FileQuestion size={22} color={theme.colors.primary[400]} />}
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.neutral[400],
                fontFamily: theme.typography.fontFamily.english.regular,
              },
            ]}
          >
            Japanese Translation App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
  },
});