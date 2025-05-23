import React, { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import _ from 'lodash';
import { Tag } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { InputIcon } from '@/components/ui/input';
import { TagSheet } from './tag-sheet';

export const TagInput = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const onInputIconPressed = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <TouchableOpacity onPress={() => onInputIconPressed()}>
        <InputIcon as={Tag}></InputIcon>
      </TouchableOpacity>
      <TagSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};
