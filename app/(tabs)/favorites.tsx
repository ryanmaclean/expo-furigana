import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import TranslationCard from '@/components/TranslationCard';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { Translation } from '@/types/Translation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '@/components/Toast';

const FAVORITES_STORAGE_KEY = '@translations_favorites';
const HISTORY_STORAGE_KEY = '@translations_history';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      let favoritesData: Translation[] = [];
      
      if (Platform.OS === 'web') {
        const storedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedData) {
          favoritesData = JSON.parse(storedData);
        }
      } else {
        const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (favoritesJson) {
          favoritesData = JSON.parse(favoritesJson);
        }
      }
      
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    // Update state first for immediate UI feedback
    setFavorites(prev => prev.filter(item => item.id !== id));
    
    // Handle storage updates in the background
    setTimeout(() => {
      try {
        if (Platform.OS === 'web') {
          // Web: Update favorites in localStorage
          const updatedFavorites = favorites.filter(item => item.id !== id);
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
          
          // Web: Update item in history
          const historyData = localStorage.getItem(HISTORY_STORAGE_KEY);
          if (historyData) {
            const history = JSON.parse(historyData);
            const updatedHistory = history.map((item: Translation) => {
              if (item.id === id) {
                return { ...item, isFavorite: false };
              }
              return item;
            });
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
          }
        } else {
          // Native: Use AsyncStorage
          const updatedFavorites = favorites.filter(item => item.id !== id);
          AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
          
          AsyncStorage.getItem(HISTORY_STORAGE_KEY).then(historyJson => {
            if (historyJson) {
              const history = JSON.parse(historyJson);
              const updatedHistory = history.map((item: Translation) => {
                if (item.id === id) {
                  return { ...item, isFavorite: false };
                }
                return item;
              });
              AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            }
          }).catch(err => {
            console.error('AsyncStorage operation failed:', err);
          });
        }
        
        displayToast('Removed from favorites');
      } catch (err) {
        console.error('Failed to update favorite:', err);
        setError('Failed to update favorite status');
      }
    }, 0);
  };

  const displayToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      // For iOS, use Alert
      Alert.alert(message);
    } else if (Platform.OS === 'web') {
      // Web toast
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(message);
      } else {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    }
  };

  const renderEmptyState = () => {
    if (error) {
      return <EmptyState type="error" message={error} />;
    }
    if (loading) {
      return <EmptyState type="favorites" message="Loading favorites..." />;
    }
    return <EmptyState type="favorites" />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Header title="Favorites" />
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TranslationCard
              english={item.english}
              japanese={item.japanese}
              furigana={item.furigana}
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onCopy={() => displayToast('Copied to clipboard')}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
      
      {/* Toast component for web */}
      {Platform.OS === 'web' && showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
});