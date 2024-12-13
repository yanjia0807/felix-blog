import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from './ui/actionsheet';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

type MyComponentProps = {
  value: any;
  onChange: (value: any) => void;
  variant: string;
};

export const CustomDatePicker: React.FC<MyComponentProps> = ({
  placeholder,
  onChange,
  value,
  variant
}: any) => {
  const [date, setDate] = useState<Date | undefined>(value);
  const [displayDate, setDisplayDate] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setDisplayDate(moment(selectedDate).format('YYYY-MM-DD'));
  };

  const onCancel = () => {
    setIsOpen(false);
  };

  const onCommit = () => {
    onChange(date);
    setIsOpen(false);
  }

  useEffect(() => {
    setDate(value);
    setDisplayDate(moment(date).format('YYYY-MM-DD'));
  }, []);

  return (
    <>
      <Input variant={variant} isReadOnly={true}>
        <InputField placeholder={placeholder} value={displayDate} onPress={() => setIsOpen(true)} />
        <InputSlot className="mr-2">
          <InputIcon as={Calendar}></InputIcon>
        </InputSlot>
      </Input>
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)} snapPoints={[40]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="h-full">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack className="flex-1 items-center justify-between">
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="spinner"
            onChange={onDateTimeChange}
          />
          <HStack className="items-center justify-around p-2">
            <Button
              className="flex-1"
              variant="link"
              onPress={() => {onCancel()}}>
              <ButtonText>取消</ButtonText>
            </Button>
            <Divider orientation="vertical"></Divider>
            <Button className="flex-1" onPress={() => {onCommit()}} action="positive">
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>

      
    </>
  );
};
