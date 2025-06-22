import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { fileFullUrl, voiceSecs } from '@/utils/file';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { usePlayVoice } from '../hooks/use-play-voice';
import { VoicePlayIcon } from './voice-play-icon';

export const SenderVoiceItem: React.FC<any> = memo(function SenderVoiceItem({ item }) {
  const { attachments, attachmentExtras } = item;
  const url = fileFullUrl(attachments[0]);
  const secs = voiceSecs(attachments[0], attachmentExtras);
  const { isPlaying, onPlay } = usePlayVoice({ url });

  return (
    <HStack className="my-2 w-full items-center" space="xs">
      <Text size="xs" className="w-1/4">
        {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
      </Text>
      <TouchableOpacity className="h-14 flex-1" onPress={onPlay}>
        <Card
          size="md"
          variant="elevated"
          className="flex-1 items-end justify-start rounded-lg bg-primary-300 p-2">
          <HStack className="items-center" space="xs">
            <Text size="xs">{secs}</Text>
            <VoicePlayIcon isPlaying={isPlaying} />
          </HStack>
        </Card>
      </TouchableOpacity>
    </HStack>
  );
});
