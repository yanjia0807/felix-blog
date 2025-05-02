import React, { useEffect, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
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
  placeholder: string;
  value: any;
  onChange: (value: any) => void;
  variant: string;
  className?: any;
  defaultDate?: any;
};

export const DateInput: React.FC<MyComponentProps> = ({
  placeholder,
  onChange,
  value,
  variant,
  className,
  defaultDate,
}: any) => {
  const [date, setDate] = useState<Date | null>();
  const [displayValue, setDisplayValue] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const onClear = () => {
    onChange(undefined);
    setDisplayValue('');
    setIsOpen(false);
  };

  const onCommit = () => {
    onChange(date);
    setDisplayValue(format(date as Date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  useEffect(() => {
    if (value) {
      setDate(value);
      setDisplayValue(format(value, 'yyyy-MM-dd'));
    } else {
      setDate(defaultDate || new Date('1900-01-01'));
      setDisplayValue('');
    }
  }, [defaultDate, value]);

  return (
    <>
      <Input variant={variant} isReadOnly={true} className={twMerge(className)}>
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
              value={date as Date}
              mode="date"
              display="spinner"
              onChange={onDateTimeChange}
              locale="zh-CN"
            />
            <HStack className="items-center justify-around">
              <Button action="positive" variant="link" className="flex-1" onPress={() => onClear()}>
                <ButtonText>清除</ButtonText>
              </Button>
              <Divider orientation="vertical" />
              <Button
                action="negative"
                variant="link"
                className="flex-1"
                onPress={() => onCommit()}>
                <ButtonText>确定</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
