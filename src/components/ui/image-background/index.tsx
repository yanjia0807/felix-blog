'use client';
import React from 'react';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { ImageBackground as RNImageBackground } from 'react-native';

const imageBackgroundStyle = tva({});

export const ImageBackground = React.forwardRef<
  React.ElementRef<typeof RNImageBackground>,
  React.ComponentProps<typeof RNImageBackground>
>(({ className, ...props }, ref) => {
  return (
    <RNImageBackground
      className={imageBackgroundStyle({
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
});
