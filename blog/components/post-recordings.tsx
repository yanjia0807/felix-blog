import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { CircleX, Volume2 } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonGroup, Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

const PostRecordings = ({ recordings = [], onRemoveRecording, className = '' }: any) => {
  const PostRecordingsStyles = tva({});

  return (
    <HStack space="sm" className={`${PostRecordingsStyles(className)} my-2 flex-wrap`}>
      {recordings.map((item: any) => {
        return (
          <PostRecordingIcon
            key={item.uri || item.getURI()}
            uri={item.uri || item.getURI()}
            onRemove={onRemoveRecording}
          />
        );
      })}
    </HStack>
  );
};

const PostRecordingIcon = ({ uri, onRemove, className }: any) => {
  const PostRecordingIconStyles = tva({});

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
    onRemove(uri);
  };

  useEffect(() => {
    const loadSound = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound, status }: any = await Audio.Sound.createAsync(
        { uri },
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
  }, [uri]);

  return (
    <ButtonGroup space="sm" isAttached={true} className={PostRecordingIconStyles({ className })}>
      <Button
        size="sm"
        onPress={() => playSound()}
        className="items-center justify-start rounded-xl">
        <ButtonIcon as={Volume2} />
        <ButtonText>{moment.utc(durationMillis).format('mm:ss')}</ButtonText>
        <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
        {onRemove && (
          <ButtonIcon
            as={CircleX}
            style={isPlaying ? { display: 'none' } : { display: 'flex' }}
            onPress={() => removeSound()}
          />
        )}
      </Button>
    </ButtonGroup>
  );
};

export default PostRecordings;
