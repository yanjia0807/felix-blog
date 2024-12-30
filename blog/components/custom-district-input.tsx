import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Locate } from 'lucide-react-native';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchDistrict } from '@/api';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export const CustomDistrictInput = ({ value, onChange, placeholder }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onInputPressed = () => {
    bottomSheetRef.current?.present();
  };

  const defaultValue = [
    {
      title: '选择省份/地区',
      level: 'province',
      adcode: null,
      name: null,
    },
    {
      title: '选择城市',
      level: 'city',
      adcode: null,
      name: null,
    },
    {
      title: '选择区/县',
      level: 'district',
      adcode: null,
      name: null,
    },
  ];

  const district = value && value.length > 0 ? value : defaultValue;

  const displayValue = _.trim(_.join(_.map(value, 'name'), ' '));

  return (
    <>
      <Input variant="rounded" isReadOnly={true}>
        <InputField
          placeholder={placeholder}
          value={displayValue}
          onPress={() => onInputPressed()}
        />
        <InputSlot className="mr-2">
          <InputIcon as={Locate}></InputIcon>
        </InputSlot>
      </Input>
      <CustomDistrictPicker ref={bottomSheetRef} onChange={onChange} value={district} />
    </>
  );
};

export const CustomDistrictPicker = forwardRef(function Sheet({ value, onChange }: any, ref: any) {
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const insets = useSafeAreaInsets();
  const [keywords, setKeywords] = useState('');
  const [district, setDistrict] = useState<any>([
    {
      title: '选择省份/地区',
      level: 'province',
      adcode: null,
      name: null,
    },
    {
      title: '选择城市',
      level: 'city',
      adcode: null,
      name: null,
    },
    {
      title: '选择区/县',
      level: 'district',
      adcode: null,
      name: null,
    },
  ]);
  const [currentLevel, setCurrentLevel] = useState<string>('province');
  const currentDistrict = _.find(district, { level: currentLevel });

  const { data, error, isLoading, isSuccess, isError, refetch } = useQuery({
    queryKey: ['district', keywords],
    queryFn: () => fetchDistrict({ keywords }),
  });

  const listData = isSuccess ? data.districts[0].districts : [];

  const onListItemPressed = ({ item }: any) => {
    setDistrict((oldValue: any) => {
      const itemIndex = _.findIndex(oldValue, { level: item.level });
      return oldValue.map((dataItem: any, index: number) => {
        if (index > itemIndex) {
          return { ...dataItem, adcode: null, name: null };
        } else if (index === itemIndex) {
          return { ...dataItem, adcode: item.adcode, name: item.name };
        } else {
          return { ...dataItem };
        }
      });
    });

    if (_.findIndex(district, { level: currentLevel }) < district.length - 1) {
      setCurrentLevel(
        (oldValue: string) => district[_.findIndex(district, { level: oldValue }) + 1]['level'],
      );
      setKeywords(item.adcode);
    }
  };

  const onSelectedBtnPressed = ({ item }: any) => {
    setCurrentLevel(item.level);
    const index = _.findIndex(district, { level: item.level });
    setKeywords(index > 0 ? district[index - 1].adcode : '');
  };

  const renderItem = ({ item }: any) => {
    return (
      <Pressable onPress={() => onListItemPressed({ item })}>
        <Text className="p-2">{item.name}</Text>
      </Pressable>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} className="my-2" />;

  const onCloseBtnPressed = () => {
    ref.current?.close();
  };

  const onConfirmBtnPressed = () => {
    onChange(district);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  const renderFooter = (props: any) => {
    return (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <HStack className="items-center justify-around bg-background-50 p-2">
          <Button className="flex-1" variant="link" onPress={() => onCloseBtnPressed()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Divider orientation="vertical"></Divider>
          <Button className="flex-1" onPress={() => onConfirmBtnPressed()} action="positive">
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    );
  };

  useEffect(() => {
    setDistrict([...value]);
  }, [value]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack space="lg" className="flex-1">
          <VStack className="mb-4 items-center">
            <Heading className="p-2">请选择所在地区</Heading>
            <Divider />
          </VStack>
          <HStack space="md">
            {district.map((item: any, index: number) => (
              <Pressable onPress={() => onSelectedBtnPressed({ item })} key={index.toString()}>
                <Text bold={item.level === currentLevel}>{item.name}</Text>
              </Pressable>
            ))}
          </HStack>
          <Text bold={true}>{currentDistrict.title}</Text>
          <BottomSheetFlatList
            contentContainerClassName="p-4 bg-background-100"
            data={listData}
            keyExtractor={(item: any) => item.adcode}
            renderItem={renderItem}
            ItemSeparatorComponent={renderItemSeparator}
            showsVerticalScrollIndicator={false}
          />
        </VStack>
      </VStack>
    </BottomSheetModal>
  );
});
