'use client';

import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import { createSwitch } from '@gluestack-ui/switch';
import React from 'react';
import { Switch as RNSwitch } from 'react-native';

const UISwitch = createSwitch({
  Root: withStyleContext(RNSwitch),
});

const switchStyle = tva({
  base: 'disabled:cursor-not-allowed web:cursor-pointer data-[invalid=true]:rounded-xl data-[invalid=true]:border-2 data-[invalid=true]:border-error-700 data-[focus=true]:outline-0 data-[focus=true]:ring-2 data-[focus=true]:ring-indicator-primary data-[disabled=true]:opacity-40',

  variants: {
    size: {
      sm: 'scale-75',
      md: '',
      lg: 'scale-125',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof UISwitch> & VariantProps<typeof switchStyle>;
const Switch = React.forwardRef<React.ComponentRef<typeof UISwitch>, ISwitchProps>(function Switch(
  { className, size = 'md', ...props },
  ref,
) {
  return <UISwitch ref={ref} {...props} className={switchStyle({ size, class: className })} />;
});

Switch.displayName = 'Switch';
export { Switch };
