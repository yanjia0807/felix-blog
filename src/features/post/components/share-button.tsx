import { Icon } from '@/components/ui/icon';
import { Share2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const ShareButton = ({ className, ...props }: any) => {
  const onShareButtonPressed = () => {};

  return (
    <TouchableOpacity className={twMerge(className)} onPress={() => onShareButtonPressed()}>
      <Icon size="md" as={Share2} />
    </TouchableOpacity>
  );
};
