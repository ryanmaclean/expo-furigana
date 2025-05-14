import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ToastProps = {
  message: string;
  duration?: number;
  onClose?: () => void;
};

// Create a global reference for showing toasts on web
if (Platform.OS === 'web') {
  if (typeof window !== 'undefined' && !window.showToast) {
    window.showToast = (message: string) => {
      // Create a div element for the toast
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = '#333';
      toast.style.color = 'white';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '9999';
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-in-out';
      toast.textContent = message;
      
      // Add the toast to the document body
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);
      
      // Remove after duration
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    };
  }
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onClose }) => {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Fade out after duration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onClose?.();
      });
    }, duration);
    
    return () => clearTimeout(timer);
  }, [fadeAnim, duration, onClose]);
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.neutral[800],
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={[styles.message, { color: theme.colors.white }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Toast;

// Add global declaration for web toast function
declare global {
  interface Window {
    showToast?: (message: string) => void;
  }
}