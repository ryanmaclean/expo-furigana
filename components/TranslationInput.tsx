import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type TranslationInputProps = {
  onTranslate: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
  onTextChange?: (text: string) => void;
};

const TranslationInput = ({ 
  onTranslate, 
  isLoading, 
  initialText = '', 
  onTextChange 
}: TranslationInputProps) => {
  const { theme } = useTheme();
  const [text, setText] = useState(initialText);
  const inputHeight = useSharedValue(Platform.OS === 'web' ? 42 : 46);

  const handleClearText = () => {
    setText('');
    if (onTextChange) {
      onTextChange('');
    }
  };

  const handleChangeText = (newText: string) => {
    setText(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      Keyboard.dismiss();
      onTranslate(text.trim());
    }
  };

  const handleFocus = () => {
    inputHeight.value = withTiming(Platform.OS === 'web' ? 46 : 80, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const handleBlur = () => {
    inputHeight.value = withTiming(Platform.OS === 'web' ? 42 : 46, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      height: inputHeight.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inputContainer,
          animatedInputStyle,
          {
            backgroundColor: theme.cardAlt,
            borderColor: theme.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              fontFamily: theme.typography.fontFamily.english.regular,
            },
          ]}
          placeholder="Enter English text..."
          placeholderTextColor={theme.colors.neutral[400]}
          value={text}
          onChangeText={handleChangeText}
          multiline
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={true}
        />
        {text.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearText}
            accessibilityLabel="Clear text"
          >
            <X
              size={18}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: theme.colors.primary[500],
            opacity: text.trim().length > 0 ? 1 : 0.5,
            height: Platform.OS === 'web' ? 42 : 46,
            width: Platform.OS === 'web' ? 46 : 48,
          },
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || isLoading}
        accessibilityLabel="Translate text"
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <ArrowRight size={22} color={theme.colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: Platform.OS === 'web' ? 10 : 14,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingTop: 2,
    paddingBottom: 2,
    textAlignVertical: 'center',
  },
  clearButton: {
    padding: 4,
  },
  submitButton: {
    marginLeft: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TranslationInput;