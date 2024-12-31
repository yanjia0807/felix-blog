import _ from 'lodash';
import { Share2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './auth-context';
import { Icon } from './ui/icon';

export const ShareButton = ({ className, ...props }: any) => {
  const { user } = useAuth();

  const onShareButtonPressed = () => {
    console.log(user);
  };

  return (
    <TouchableOpacity className={twMerge(className)} onPress={() => onShareButtonPressed()}>
      <Icon size="md" as={Share2} />
    </TouchableOpacity>
  );
};
