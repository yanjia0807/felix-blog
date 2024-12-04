import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark' | undefined;

interface PreferencesContextType {
  theme: Theme;
  updateTheme: (newTheme: Theme) => void;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>();

  useEffect(() => {
    (async () => {
      const savedTheme = (await AsyncStorage.getItem('theme')) as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        AsyncStorage.setItem('theme', savedTheme);
      }
    })();
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme) {
      AsyncStorage.setItem('theme', newTheme);
    } else {
      AsyncStorage.removeItem('theme');
    }
  };

  return <PreferencesContext.Provider value={{ theme, updateTheme }}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
