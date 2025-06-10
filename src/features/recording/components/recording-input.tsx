import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import useToast from '@/hooks/use-toast';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { Mic } from 'lucide-react-native';
import { useRef } from 'react';
import { Keyboard } from 'react-native';
import { RecordingSheet } from './recording-sheet';

const appName = Constants?.expoConfig?.extra?.name || '';

export const RecordingInput = ({ onChange, value }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const toast = useToast();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const onInputIconPressed = async () => {
    if (audioPermission?.granted) {
      bottomSheetRef.current?.present();
      Keyboard.dismiss();
    } else {
      const result = await requestAudioPermission();
      if (result.granted) {
        bottomSheetRef.current?.present();
        Keyboard.dismiss();
      } else {
        if (!result.canAskAgain) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的麦克风。`,
          });
        }
      }
    }
  };

  return (
    <>
      <Button variant="link" action="secondary" onPress={() => onInputIconPressed()}>
        <ButtonIcon as={Mic} />
        <ButtonText>录音</ButtonText>
      </Button>
      <RecordingSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};
