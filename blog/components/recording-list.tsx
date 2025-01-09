import { intervalToDuration } from 'date-fns';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { CircleX, Trash2, Volume2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { apiServerURL } from '@/api';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

export const RecordingList = ({ recordings, onRemove, className = '' }: any) => {
  if (recordings.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {recordings.map((item: any) => (
          <RecordingIcon key={item._uri || item.url} item={item} onRemove={onRemove} />
        ))}
      </HStack>
    );
  }
};

export const RecordingIcon = ({ item, onRemove, className }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const recordingRef = useRef<any>({ sound: null, isPlaying: false });

  const duration: any = intervalToDuration({ start: 0, end: durationMillis });
  const formattedTime = `${String(duration?.minutes || '').padStart(2, '0')}:${String(duration?.seconds || '').padStart(2, '0')}`;

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      recordingRef.current.isPlaying = status.isPlaying;
      setIsPlaying(status.isPlaying);
    }
  };

  const onItemPress = async () => {
    if (!recordingRef.current.isPlaying) {
      await recordingRef.current.sound.setPositionAsync(0);
      await recordingRef.current.sound.playAsync();
    } else {
      await recordingRef.current.sound.stopAsync();
    }
  };

  const onRemoveBtnPress = async () => {
    const key = item._uri || item.url;
    onRemove(key);
  };

  useEffect(() => {
    const loadAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      let source = item._uri ? { uri: item._uri } : { uri: `${apiServerURL}${item.url}` };
      const { sound, status }: any = await Audio.Sound.createAsync(
        source,
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );
      setDurationMillis(status.durationMillis);
      recordingRef.current.sound = sound;
    };
    loadAudio();

    return recordingRef.current.sound
      ? () => {
          recordingRef.current.sound.unloadAsync();
        }
      : undefined;
  }, [item._uri, item.url]);

  return (
    <Button
      onPress={() => onItemPress()}
      className={twMerge(className, 'my-2 items-center justify-start rounded')}>
      <ButtonIcon as={Volume2} />
      <ButtonText>{formattedTime}</ButtonText>
      <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
      {onRemove && (
        <Button size="xs" action="negative" className="p-1" onPress={() => onRemoveBtnPress()}>
          <ButtonIcon as={Trash2} />
        </Button>
      )}
    </Button>
  );
};
