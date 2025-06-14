import { ImageryItem } from '@/components/imagery-item';
import { usePreferences } from '@/components/preferences-provider';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

export const BannerItem: React.FC<any> = memo(function BannerItem({ item }) {
  const router = useRouter();
  const { theme } = usePreferences();

  const onItemPress = () => {
    if (item.link) {
      if (!item.link.isExternal) {
        router.push(item.link.src);
      }
    }
  };

  return (
    <TouchableOpacity onPress={() => onItemPress()} className={`mr-4 h-48 w-80`}>
      <ImageryItem
        source={{ uri: imageFormat(item.image, 'l')?.fullUrl }}
        cacheKey={item.image.name}
        mime={item.image.mime}
        alt={item.image.alternativeText || item.image.name}
        className="h-full w-full rounded-md"
      />
      <View className="absolute bottom-0 w-full rounded-md">
        <BlurView intensity={10} tint={theme === 'light' ? 'light' : 'dark'}>
          <VStack space="md" className="p-2">
            <Text size="lg" bold={true} className="text-white" numberOfLines={2}>
              {item.title}
            </Text>
            <HStack className="items-center justify-between">
              <Text size="sm" className="text-white">
                {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
              </Text>
              <HStack space="xs" className="items-center">
                <Avatar size="sm">
                  <AvatarFallbackText>{item.author.username}</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: imageFormat(item.author.avatar, 's', 't')?.fullUrl,
                    }}
                  />
                </Avatar>
                <Text size="sm" className="text-white">
                  {item.author.username}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
});
