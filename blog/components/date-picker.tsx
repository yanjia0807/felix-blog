import React, { useEffect, useRef, useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { Calendar, CircleX } from "lucide-react-native";
import moment from "moment";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";

export const DatePicker: React.FC = ({
  placeholder,
  onChange,
  value,
  variant,
}: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [date, setDate] = useState<Date | undefined>(value);
  const [displayDate, setDisplayDate] = useState<string | undefined>(
    moment(date).format("YYYY-MM-DD")
  );

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const onDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    setDate(selectedDate);
    setDisplayDate(moment(selectedDate).format("YYYY-MM-DD"));
    onChange(selectedDate);
  };

  const onClear = () => {
    setDate(undefined);
    setDisplayDate(undefined);
    onChange(undefined);
  };

  useEffect(() => {
    setDate(value);
    setDisplayDate(moment(date).format("YYYY-MM-DD"));
  }, []);

  return (
    <>
      <Input variant={variant} isReadOnly={true}>
        <InputField
          placeholder={placeholder}
          value={displayDate}
          onPress={openBottomSheet}
        />
        <InputSlot className="mr-2">
          <InputIcon as={Calendar}></InputIcon>
        </InputSlot>
      </Input>
      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleComponent={BottomSheetDragIndicator}
        enableDynamicSizing={true}
      >
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
