import _ from 'lodash';
import { useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const MAX_RECORDING_DURATION = 20000;

const audioRecorderPlayer = new AudioRecorderPlayer();

export const useRecordVoice = ({ startCb, stopCb, successCb }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(null);

  const onStartRecord = async () => {
    try {
      await audioRecorderPlayer.startRecorder(undefined, undefined, true);
      setIsRecording(true);
      startCb();

      audioRecorderPlayer.addRecordBackListener((e: any) => {
        console.log(e);
        setRecordingStatus({
          metering: e.currentMetering,
          position: e.currentPosition,
          recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
          remainingTime: _.floor((MAX_RECORDING_DURATION - e.currentPosition) / 1000),
        });
      });
    } catch (error) {
      console.error(error);
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordingStatus(null);
      stopCb();
    }
  };

  const onStopRecord = async (success) => {
    try {
      const path = await audioRecorderPlayer.stopRecorder();
      const secs = _.floor(recordingStatus.position / 1000, 2);
      audioRecorderPlayer.removeRecordBackListener();

      if (success) {
        successCb({
          file: path,
          secs,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordingStatus(null);
      stopCb();
    }
  };

  return {
    isRecording,
    recordingStatus,
    onStartRecord,
    onStopRecord,
  };
};
