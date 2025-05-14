import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import TranslationHistoryItem from '@/components/TranslationHistoryItem';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { Translation } from '@/types/Translation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import { Search, Circle as XCircle } from 'lucide-react-native';
import Toast from '@/components/Toast';

const HISTORY_STORAGE_KEY = '@translations_history';
const FAVORITES_STORAGE_KEY = '@translations_favorites';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [history, setHistory] = useState<Translation[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = history.filter(
        item => 
          item.english.toLowerCase().includes(query) || 
          item.japanese.includes(query)
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      let historyData: Translation[] = [];
      
      if (Platform.OS === 'web') {
        try {
          const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
          if (storedData) {
            historyData = JSON.parse(storedData);
          }
        } catch (err) {
          console.error('localStorage error:', err);
          setError('Failed to load translation history');
        }
      } else {
        const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (historyJson) {
          historyData = JSON.parse(historyJson);
        }
      }
      
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load translation history');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    try {
      // Update UI immediately
      const updatedHistory = history.map(item => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
      });
      
      setHistory(updatedHistory);
      
      // Update filtered results too if needed
      if (searchQuery.trim() !== '') {
        setFilteredHistory(updatedHistory.filter(item => 
          item.english.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.japanese.includes(searchQuery)
        ));
      } else {
        setFilteredHistory(updatedHistory);
      }
      
      // Then update storage in background
      setTimeout(async () => {
        try {
          // Get the translation that was toggled
          const translation = updatedHistory.find(item => item.id === id);
          if (!translation) return;
          
          if (Platform.OS === 'web') {
            // Update history in localStorage
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            
            // Update favorites in localStorage
            const favoritesData = localStorage.getItem(FAVORITES_STORAGE_KEY);
            let favorites: Translation[] = favoritesData ? JSON.parse(favoritesData) : [];
            
            if (translation.isFavorite) {
              // Add to favorites
              favorites.unshift(translation);
              displayToast('Added to favorites');
            } else {
              // Remove from favorites
              favorites = favorites.filter(item => item.id !== id);
              displayToast('Removed from favorites');
            }
            
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
          } else {
            // Update history in AsyncStorage
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            
            // Update favorites in AsyncStorage
            const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            let favorites: Translation[] = favoritesJson ? JSON.parse(favoritesJson) : [];
            
            if (translation.isFavorite) {
              // Add to favorites
              favorites.unshift(translation);
              displayToast('Added to favorites');
            } else {
              // Remove from favorites
              favorites = favorites.filter(item => item.id !== id);
              displayToast('Removed from favorites');
            }
            
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
          }
        } catch (err) {
          console.error('Failed to update storage:', err);
        }
      }, 0);
    } catch (err) {
      console.error('Failed to update favorite:', err);
      setError('Failed to update favorite status');
    }
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

  const viewTranslationDetails = (item: Translation) => {
    // Navigate to the translate tab with this item
    navigation.navigate('index' as never);
    
    // We would ideally want to pass the translation to the translate screen here
    // For now, we'll need to handle this with a global state or context in a real app
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderSearchBar = () => (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: theme.cardAlt,
          borderColor: theme.border,
        },
      ]}
    >
      <Search size={18} color={theme.colors.neutral[400]} />
      <TextInput
        style={[
          styles.searchInput,
          {
            color: theme.text,
            fontFamily: theme.typography.fontFamily.english.regular,
          },
        ]}
        placeholder="Search translations..."
        placeholderTextColor={theme.colors.neutral[400]}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XCircle size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (error) {
      return <EmptyState type="error" message={error} />;
    }
    if (loading) {
      return <EmptyState type="history" message="Loading history..." />;
    }
    if (searchQuery && filteredHistory.length === 0) {
      return <EmptyState type="history" message="No matches found" />;
    }
    return <EmptyState type="history" />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Header title="History" />
      
      {renderSearchBar()}
      
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TranslationHistoryItem
              item={item}
              onPress={() => viewTranslationDetails(item)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
      
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
});