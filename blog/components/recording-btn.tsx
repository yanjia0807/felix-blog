import React, { useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { CircleX, Volume2 } from 'lucide-react-native';
import { ButtonGroup, Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import moment from 'moment';

const SoundBtn = ({ uri, durationMillis, onRemove }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundObj = useRef<any>({ sound: null, isPlaying: false });

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    console.log('update status', status);
    if (status.isLoaded) {
      soundObj.current.isPlaying = status.isPlaying;
      setIsPlaying(status.isPlaying);
    }
  };

  const playSound = async () => {
    console.log(soundObj.current);
    if (!soundObj.current.sound) {
      console.log('loading sound');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );
      console.log('loaded sound');
      soundObj.current.sound = sound;
    } else {
      if (!soundObj.current.isPlaying) {
        console.log('playing sound');
        await soundObj.current.sound.setPositionAsync(0);
        await soundObj.current.sound.playAsync();
        console.log('played sound');
      } else {
        console.log('stoping sound');
        await soundObj.current.sound.stopAsync();
        console.log('stoped sound');
      }
    }
  };

  const removeSound = async () => {
    onRemove(uri);
  };

  useEffect(() => {
    return soundObj.current.sound
      ? () => {
          console.log('unloading Sound');
          soundObj.current.sound.unloadAsync();
        }
      : undefined;
  }, [soundObj]);

  return (
    <ButtonGroup space="xs" isAttached={true} className="m-1">
      <Button
        size="xs"
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

export default SoundBtn;