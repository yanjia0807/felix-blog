import { Portal } from '@/components/ui/portal';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraSubmitButton } from './camera-submit-button';
import ImageViewer from './image-viewer';
import VideoViewer from './video-viewer';

export const CameraPreview: React.FC<any> = React.memo(function CameraPreview({
  type,
  data,
  onClose,
  onCommit,
}): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleCommit = () => {
    onCommit(data);
    setIsOpen(false);
  };

  return (
    <Portal isOpen={isOpen} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-black">
        {type === 'photo' ? (
          <ImageViewer item={data} onClose={() => handleClose()} />
        ) : (
          <VideoViewer item={data} onClose={() => handleClose()} />
        )}
        <CameraSubmitButton onCommit={() => handleCommit()} />
      </SafeAreaView>
    </Portal>
  );
});
