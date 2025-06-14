import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { fileFullUrl, imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { usePlayVoice } from '../hooks/use-play-voice';
import { VoicePlayIcon } from './voice-play-icon';

export const ReceiverVoiceItem: React.FC<any> = memo(function ReceiverVoiceItem({
  item,
  otherUser,
}) {
  const url = fileFullUrl(item.voice?.file);
  const { isPlaying, onPlay } = usePlayVoice({ url });

  return (
    <HStack className="my-2 w-full items-center justify-between" space="xs">
      <HStack className="flex-1" space="xs">
        <Avatar size="xs">
          <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
            }}
          />
        </Avatar>
        <TouchableOpacity className="h-14 flex-1" onPress={onPlay}>
          <Card
            size="md"
            variant="elevated"
            className="flex-1 items-end justify-start rounded-lg bg-primary-200 p-2">
            <HStack className="items-center" space="xs">
              <Text size="xs">{item.voice?.secs}</Text>
              <VoicePlayIcon isPlaying={isPlaying} />
            </HStack>
          </Card>
        </TouchableOpacity>
      </HStack>
      <Text size="xs" className="w-1/4 text-right">
        {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
      </Text>
    </HStack>
  );
});
