import { Theme } from '@react-navigation/native';
import { fonts } from '@react-navigation/native/src/theming/fonts';

export const DefaultTheme: Theme = {
  dark: false,
  colors: {
    primary: '#43865C',
    background: '#f6f6f6',
    card: '#F2F1F1',
    text: '#525252',
    border: '#f3f3f3',
    notification: '#f18f01',
  },
  fonts,
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#43865C',
    background: '#272625',
    card: '#414040',
    text: '#dbdbdc',
    border: '#272624',
    notification: '#f18f01',
  },
  fonts,
};
