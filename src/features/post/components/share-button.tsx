import React from 'react';
import { Share2 } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Icon } from '@/components/ui/icon';

export const ShareButton = ({ className, ...props }: any) => {
  const onShareButtonPressed = () => {};

  return (
    <TouchableOpacity className={twMerge(className)} onPress={() => onShareButtonPressed()}>
      <Icon size="md" as={Share2} />
    </TouchableOpacity>
  );
};
