import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { intervalToDuration } from 'date-fns';
import { CircleX, Volume2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export const RecordingIcon = ({ item, onRemove, className, readonly }: any) => {
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

  useEffect(() => {
    const loadAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound, status }: any = await Audio.Sound.createAsync(
        { uri: item.uri },
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
  }, [item.uri]);

  return (
    <Button
      onPress={() => onItemPress()}
      className={twMerge(
        className,
        'items-center justify-start rounded opacity-50',
        !readonly ? 'pr-8' : undefined,
      )}>
      <ButtonIcon as={Volume2} />
      <ButtonText>{formattedTime}</ButtonText>
      <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
      {!readonly && (
        <Button
          size="xs"
          className="absolute right-0 top-0 h-auto p-1"
          onPress={() => onRemove(item.uri)}>
          <ButtonIcon as={CircleX} />
        </Button>
      )}
    </Button>
  );
};
