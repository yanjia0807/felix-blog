import { Theme } from '@react-navigation/native';
import { fonts } from '@react-navigation/native/src/theming/fonts';

export const DefaultTheme: Theme = {
  dark: false,
  colors: {
    primary: '#68a67d',
    background: '#F6F6F6',
    card: '#F2F1F1',
    text: '#262627',
    border: '#E6E6E6',
    notification: 'rgb(255, 59, 48)',
  },
  fonts,
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#348352',
    background: '#272625',
    card: '#414040',
    text: '#F5F5F5',
    border: 'rgb(65 65 65)',
    notification: 'rgb(255, 69, 58)',
  },
  fonts,
};
