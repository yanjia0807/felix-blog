import React from 'react';
import { Share2 } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../features/auth/components/auth-provider';
import { Icon } from './ui/icon';

export const ShareButton = ({ className, ...props }: any) => {
  const { user } = useAuth();

  const onShareButtonPressed = () => {};

  return (
    <TouchableOpacity className={twMerge(className)} onPress={() => onShareButtonPressed()}>
      <Icon size="md" as={Share2} />
    </TouchableOpacity>
  );
};
