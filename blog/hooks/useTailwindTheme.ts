import { useEffect, useState } from 'react';
import { usePreferences } from '@/components/preferences-provider';

const useTailwindTheme = () => {
  const [themeColors, setThemeColors] = useState({});
  const { theme } = usePreferences();

  useEffect(() => {
    const colors = {
      background: getComputedStyle(document.documentElement).getPropertyValue(
        '--color-background-0',
      ),
    };
    setThemeColors(colors);
  }, [theme]);

  return themeColors;
};

export default useTailwindTheme;
