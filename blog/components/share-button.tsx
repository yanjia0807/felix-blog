import { tva } from '@gluestack-ui/nativewind-utils/tva';
import _ from 'lodash';
import { Share2 } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useAuth } from './auth-context';
import { Icon } from './ui/icon';

const ShareButtonStyles = tva({});

const ShareButton = ({ className, ...props }: any) => {
  const { user } = useAuth();

  const onShareButtonPressed = () => {
    console.log(user);
  };

  return (
    <TouchableOpacity
      className={ShareButtonStyles({ className })}
      onPress={() => onShareButtonPressed()}>
      <Icon size="md" className="text-secondary-0" as={Share2} />
    </TouchableOpacity>
  );
};

export default ShareButton;
