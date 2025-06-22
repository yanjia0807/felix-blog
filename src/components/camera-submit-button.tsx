import { Check } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui/icon';

export const CameraSubmitButton: React.FC<any> = React.memo(function CameraSubmitButton({
  onCommit,
  ...props
}): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        alignSelf: 'center',
        bottom: insets.bottom + 10,
      }}
      {...props}
      onPress={onCommit}>
      <View className="h-[68] w-[68] items-center justify-center rounded-full border-4 border-primary-500 bg-primary-400 opacity-70">
        <Icon as={Check} size="xl" />
      </View>
    </TouchableOpacity>
  );
});
