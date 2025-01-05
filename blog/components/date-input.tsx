import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from './ui/actionsheet';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { VStack } from './ui/vstack';

type MyComponentProps = {
  value: any;
  onChange: (value: any) => void;
  variant: string;
};

export const DateInput: React.FC<MyComponentProps> = ({ placeholder, onChange, value }: any) => {
  const [date, setDate] = useState<Date | null>();
  const [displayValue, setDisplayValue] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const onClear = () => {
    onChange(null);
    setDisplayValue('');
    setIsOpen(false);
  };

  const onCommit = () => {
    onChange(date);
    setDisplayValue(moment(date).format('YYYY-MM-DD'));
    setIsOpen(false);
  };

  useEffect(() => {
    if (value) {
      setDate(value);
      setDisplayValue(moment(value).format('YYYY-MM-DD'));
    } else {
      setDate(new Date('1990-01-01'));
      setDisplayValue('');
    }
  }, [value]);

  return (
    <>
      <Input variant="rounded" isReadOnly={true}>
        <InputField
          placeholder={placeholder}
          value={displayValue}
          onPress={() => setIsOpen(true)}
        />
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
              value={date}
              mode="date"
              display="spinner"
              onChange={onDateTimeChange}
              locale="zh-CN"
            />
            <HStack className="items-center justify-around p-2">
              <Button className="flex-1" action="negative" variant="link" onPress={() => onClear()}>
                <ButtonText>清除</ButtonText>
              </Button>
              <Divider orientation="vertical"></Divider>
              <Button
                className="flex-1"
                onPress={() => {
                  onCommit();
                }}
                action="positive">
                <ButtonText>确定</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
