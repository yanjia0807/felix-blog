import { Audio, AVPlaybackStatus } from 'expo-av';
import { CircleX, Volume2 } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { apiServerURL } from '@/api';
import { ButtonGroup, Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

export const RecordingList = ({ recordings = [], onRemoveRecording, className = '' }: any) => {
  return (
    <HStack space="sm" className={twMerge('flex-wrap', className)}>
      {recordings.map((item: any) => {
        const key = item._uri || item.url;
        return <RecordingIcon key={key} item={item} onRemove={onRemoveRecording} />;
      })}
    </HStack>
  );
};

export const RecordingIcon = ({ item, onRemove, className }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const soundObj = useRef<any>({ sound: null, isPlaying: false });

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      soundObj.current.isPlaying = status.isPlaying;
      setIsPlaying(status.isPlaying);
    }
  };

  const playSound = async () => {
    if (!soundObj.current.isPlaying) {
      await soundObj.current.sound.setPositionAsync(0);
      await soundObj.current.sound.playAsync();
    } else {
      await soundObj.current.sound.stopAsync();
    }
  };

  const removeSound = async () => {
    const key = item._uri || item.url;
    onRemove(key);
  };

  useEffect(() => {
    const loadSound = async () => {
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
      soundObj.current.sound = sound;
    };
    loadSound();

    return soundObj.current.sound
      ? () => {
          soundObj.current.sound.unloadAsync();
        }
      : undefined;
  }, [item._uri, item.url]);

  return (
    <ButtonGroup space="sm" isAttached={true} className={twMerge(className)}>
      <Button
        size="sm"
        onPress={() => playSound()}
        className="items-center justify-start rounded-xl">
        <ButtonIcon as={Volume2} />
        <ButtonText>{moment.utc(durationMillis).format('mm:ss')}</ButtonText>
        <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
        {onRemove && (
          <Pressable onPress={() => removeSound()}>
            <ButtonIcon
              as={CircleX}
              style={isPlaying ? { display: 'none' } : { display: 'flex' }}
            />
          </Pressable>
        )}
      </Button>
    </ButtonGroup>
  );
};
