import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import TranslationInput from '@/components/TranslationInput';
import TranslationCard from '@/components/TranslationCard';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { translateText } from '@/services/translateService';
import { Translation } from '@/types/Translation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '@/components/Toast';

const HISTORY_STORAGE_KEY = '@translations_history';
const FAVORITES_STORAGE_KEY = '@translations_favorites';

export default function TranslateScreen() {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load history from storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Filter translations as user types
  useEffect(() => {
    if (inputText.trim()) {
      const normalizedInput = inputText.toLowerCase().trim();
      const filtered = translations.filter(item => 
        item.english.toLowerCase().includes(normalizedInput)
      );
      setFilteredTranslations(filtered);
    } else {
      // When input is empty, show full history
      setFilteredTranslations(translations);
    }
  }, [inputText, translations]);

  const loadHistory = async () => {
    try {
      let historyData: Translation[] = [];
      
      // Use localStorage on web
      if (Platform.OS === 'web') {
        try {
          const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
          if (storedData) {
            historyData = JSON.parse(storedData);
          }
        } catch (err) {
          console.error('localStorage error:', err);
        }
      } else {
        const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (historyJson) {
          historyData = JSON.parse(historyJson);
        }
      }
      
      if (historyData && historyData.length > 0) {
        setTranslations(historyData);
        setFilteredTranslations(historyData);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load translation history');
    }
  };

  const saveToHistory = (translation: Translation) => {
    // Update state FIRST for immediate UI update
    setTranslations(prevTranslations => {
      // Get fresh copy to avoid stale state
      const currentTranslations = [...prevTranslations];
      
      // Remove existing translation with same text if it exists
      const filteredTranslations = currentTranslations.filter(
        item => item.english.toLowerCase() !== translation.english.toLowerCase()
      );
      
      // Add new translation at the beginning
      return [translation, ...filteredTranslations].slice(0, 100);
    });
    
    // Then save to storage asynchronously
    setTimeout(() => {
      try {
        // For web
        if (Platform.OS === 'web') {
          try {
            // Get current history directly from localStorage
            const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
            let history: Translation[] = storedData ? JSON.parse(storedData) : [];
            
            // Remove existing if found
            history = history.filter(
              item => item.english.toLowerCase() !== translation.english.toLowerCase()
            );
            
            // Add new translation
            history.unshift(translation);
            
            // Limit history size
            history = history.slice(0, 100);
            
            // Save to localStorage
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
          } catch (err) {
            console.error('localStorage error:', err);
          }
        } else {
          // For native platforms
          AsyncStorage.getItem(HISTORY_STORAGE_KEY).then(historyJson => {
            let history: Translation[] = historyJson ? JSON.parse(historyJson) : [];
            
            // Remove existing if found
            history = history.filter(
              item => item.english.toLowerCase() !== translation.english.toLowerCase()
            );
            
            // Add new translation
            history.unshift(translation);
            
            // Limit history size
            history = history.slice(0, 100);
            
            // Save to AsyncStorage
            AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
          }).catch(err => {
            console.error('AsyncStorage operation failed:', err);
          });
        }
      } catch (err) {
        console.error('Failed to save to history:', err);
      }
    }, 0);
  };

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await translateText(text);
      
      const newTranslation: Translation = {
        id: Date.now().toString(),
        english: text,
        japanese: result.japanese,
        furigana: result.furigana,
        timestamp: Date.now(),
        isFavorite: false,
      };
      
      // Update UI immediately with the current translation
      setCurrentTranslation(newTranslation);
      
      // Save to history
      saveToHistory(newTranslation);
      
      // Clear input after successful translation
      setInputText('');
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    // First check if we're toggling the current translation
    if (currentTranslation && currentTranslation.id === id) {
      setCurrentTranslation(prev => {
        if (!prev) return null;
        return { ...prev, isFavorite: !prev.isFavorite };
      });
    }
    
    // Update state FIRST for immediate UI feedback
    setTranslations(prevTranslations => {
      const updatedTranslations = prevTranslations.map(item => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
      return updatedTranslations;
    });
    
    // Then handle storage updates in the background
    setTimeout(() => {
      try {
        // Get the updated translation from the most current state
        const translation = [...translations].find(item => item.id === id);
        if (!translation) return;
        
        const isFavorite = !translation.isFavorite;
        
        if (Platform.OS === 'web') {
          try {
            // Web: Update history in localStorage
            const historyData = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (historyData) {
              const history = JSON.parse(historyData);
              const updatedHistory = history.map((item: Translation) => {
                if (item.id === id) {
                  return { ...item, isFavorite };
                }
                return item;
              });
              localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            }
            
            // Web: Update favorites in localStorage
            const favoritesData = localStorage.getItem(FAVORITES_STORAGE_KEY);
            let favorites: Translation[] = favoritesData ? JSON.parse(favoritesData) : [];
            
            if (isFavorite) {
              // Add to favorites
              favorites.unshift({ ...translation, isFavorite: true });
              displayToast('Added to favorites');
            } else {
              // Remove from favorites
              favorites = favorites.filter(item => item.id !== id);
              displayToast('Removed from favorites');
            }
            
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
          } catch (err) {
            console.error('localStorage error:', err);
          }
        } else {
          // Native: Use AsyncStorage
          AsyncStorage.getItem(HISTORY_STORAGE_KEY).then(historyJson => {
            if (historyJson) {
              const history = JSON.parse(historyJson);
              const updatedHistory = history.map((item: Translation) => {
                if (item.id === id) {
                  return { ...item, isFavorite };
                }
                return item;
              });
              AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            }
            
            return AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
          }).then(favoritesJson => {
            if (favoritesJson) {
              let favorites: Translation[] = JSON.parse(favoritesJson);
              const updatedTranslation = { ...translation, isFavorite };
              
              if (isFavorite) {
                // Add to favorites
                favorites.unshift(updatedTranslation);
                displayToast('Added to favorites');
              } else {
                // Remove from favorites
                favorites = favorites.filter(item => item.id !== id);
                displayToast('Removed from favorites');
              }
              
              AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            }
          }).catch(err => {
            console.error('AsyncStorage operation failed:', err);
          });
        }
      } catch (err) {
        console.error('Failed to update favorite:', err);
      }
    }, 0);
  };

  const displayToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert(message);
    } else if (Platform.OS === 'web') {
      // Web toast notification
      setToastMessage(message);
      setShowToast(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  };

  const renderEmptyState = () => {
    if (error) {
      return <EmptyState type="error" message={error} />;
    }
    return <EmptyState type="translation" />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Header title="Translate" />
      
      <TranslationInput
        onTranslate={handleTranslate}
        isLoading={isLoading}
        initialText={inputText}
        onTextChange={setInputText}
      />
      
      {currentTranslation && (
        <View style={styles.currentTranslationContainer}>
          <TranslationCard
            english={currentTranslation.english}
            japanese={currentTranslation.japanese}
            furigana={currentTranslation.furigana}
            isFavorite={currentTranslation.isFavorite}
            onToggleFavorite={() => toggleFavorite(currentTranslation.id)}
            onCopy={() => displayToast('Copied to clipboard')}
          />
        </View>
      )}
      
      {/* Show filtered history even when we have a current translation */}
      {filteredTranslations.length > 0 && (
        <FlatList
          data={filteredTranslations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TranslationCard
              english={item.english}
              japanese={item.japanese}
              furigana={item.furigana}
              isFavorite={item.isFavorite}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onCopy={() => displayToast('Copied to clipboard')}
            />
          )}
          contentContainerStyle={styles.listContent}
          // Filter out the current translation from the list to avoid duplication
          ListHeaderComponent={currentTranslation ? null : undefined}
          initialNumToRender={5}
        />
      )}
      
      {!currentTranslation && filteredTranslations.length === 0 && renderEmptyState()}
      
      {Platform.OS === 'web' && showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTranslationContainer: {
    marginTop: Platform.OS === 'web' ? 0 : 8,
  },
  listContent: {
    paddingBottom: 20,
  },
});