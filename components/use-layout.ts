import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

export function useLayout() {
  const [layout, setLayout] = React.useState<{
    x: number;
    y: number;
    height: number;
    width: number;
    measured: boolean;
  }>({ x: 0, y: 0, height: 0, width: 0, measured: false });

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const { height, width, x, y } = e.nativeEvent.layout;

      if (height === layout.height && width === layout.width) {
        return;
      }

      setLayout({
        x,
        y,
        height,
        width,
        measured: true,
      });
    },
    [layout.height, layout.width],
  );

  return [layout, onLayout] as const;
}
