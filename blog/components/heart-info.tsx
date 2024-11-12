import { TouchableOpacity } from 'react-native';
import React from 'react';
import { HStack } from './ui/hstack';
import colors from 'tailwindcss/colors';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { Heart } from 'lucide-react-native';

const HeartInfo = () => {
  return (
    <TouchableOpacity>
      <HStack space="xs" className="items-center">
        <Icon as={Heart} color={colors.red[500]} />
        <Text size="xs">321</Text>
      </HStack>
    </TouchableOpacity>
  );
};

export default HeartInfo;
