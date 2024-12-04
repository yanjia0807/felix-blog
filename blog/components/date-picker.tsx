import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';

type MyComponentProps = {
  value: any;
  onChange: (value: any) => void;
  variant: string;
};

export const DatePicker: React.FC<MyComponentProps> = ({
  placeholder,
  onChange,
  value,
  variant,
}: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [date, setDate] = useState<Date | undefined>(value);
  const [displayDate, setDisplayDate] = useState<string | undefined>();

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setDisplayDate(moment(selectedDate).format('YYYY-MM-DD'));
    onChange(selectedDate);
  };

  const onClear = () => {
    setDate(undefined);
    setDisplayDate(undefined);
    onChange(undefined);
  };

  useEffect(() => {
    setDate(value);
    setDisplayDate(moment(date).format('YYYY-MM-DD'));
  }, []);

  return (
    <>
      <Input variant={variant} isReadOnly={true}>
        <InputField placeholder={placeholder} value={displayDate} onPress={openBottomSheet} />
        <InputSlot className="mr-2">
          <InputIcon as={Calendar}></InputIcon>
        </InputSlot>
      </Input>
      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={BottomSheetBackdrop}
        enableDynamicSizing={true}>
        <BottomSheetView>
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="spinner"
            onChange={onDateTimeChange}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};
