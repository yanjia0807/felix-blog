import { useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

export const usePlayVoice = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const onStartPlay = async () => {
    try {
      await audioRecorderPlayer.startPlayer(url);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.isFinished) {
          setIsPlaying(false);
        }
      });
      audioRecorderPlayer.setVolume(1.0);
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
      audioRecorderPlayer.removePlayBackListener();
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error(error);
    } finally {
      audioRecorderPlayer.removePlayBackListener();
    }
  };

  const onPlay = () => {
    if (isPlaying) {
      onStopPlay();
    } else {
      onStartPlay();
    }
  };

  return {
    isPlaying,
    onPlay,
  };
};
