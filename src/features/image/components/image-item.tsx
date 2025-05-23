import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { CircleX } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonIcon } from '@/components/ui/button';
import { isVideo } from '@/utils/file';

export const ImageItem = ({ item, onPress, onRemove, className, style }: any) => {
  return (
    <View className={twMerge([className])} style={style}>
      <TouchableOpacity onPress={onPress}>
        <View className="items-center justify-center">
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 6,
              opacity: 0.7,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            alt={item.alternativeText || item.name}
            source={item.thumbnail}></Image>
          {isVideo(item.fileType) && (
            <View className="absolute">
              <Ionicons name="play-circle-outline" size={24} className="opacity-50" color="white" />
            </View>
          )}
          {onRemove && (
            <Button
              size="xs"
              action="secondary"
              className="absolute right-0 top-0 h-auto p-1 opacity-80"
              onPress={onRemove}>
              <ButtonIcon as={CircleX} />
            </Button>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
