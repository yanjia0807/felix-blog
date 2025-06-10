import { Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

const WEB_FONT_STACK =
  'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const fonts = Platform.select({
  web: {
    regular: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '400' as any,
    },
    medium: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '500' as any,
    },
    bold: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '600' as any,
    },
    heavy: {
      fontFamily: WEB_FONT_STACK,
      fontWeight: '700' as any,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as any,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as any,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '600' as any,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '700' as any,
    },
  },
  default: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'sans-serif',
      fontWeight: '600',
    },
    heavy: {
      fontFamily: 'sans-serif',
      fontWeight: '700',
    },
  },
});
export const DefaultTheme: Theme = {
  dark: false,
  colors: {
    primary: '#bedcc5',
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
    primary: '#214430',
    background: '#272625',
    card: '#414040',
    text: '#dbdbdc',
    border: '#272624',
    notification: '#f18f01',
  },
  fonts,
};
