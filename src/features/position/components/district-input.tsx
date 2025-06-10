import { fetchDistrict } from '@/api';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DistrictInput = ({ value, onChange, placeholder }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onInputPressed = () => {
    bottomSheetRef.current?.present();
  };

  const displayValue = value
    ? `${value.provinceName || ''} ${value.cityName || ''} ${value.districtName || ''}`
    : '';

  return (
    <>
      <Input variant="rounded" isReadOnly={true}>
        <InputField
          placeholder={placeholder}
          value={displayValue}
          onPress={() => onInputPressed()}
        />
        <InputSlot className="mr-2">
          <InputIcon as={MapPin}></InputIcon>
        </InputSlot>
      </Input>
      <DistrictPicker ref={bottomSheetRef} onChange={(val: any) => onChange(val)} value={value} />
    </>
  );
};

export const DistrictPicker = forwardRef(function Sheet({ value, onChange }: any, ref: any) {
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const insets = useSafeAreaInsets();
  const [keywords, setKeywords] = useState('');
  const [district, setDistrict] = useState<any>();
  const [currentLevel, setCurrentLevel] = useState<string>('province');
  const levelLabels = [
    {
      level: 'province',
      label: '选择省份/地区',
    },
    {
      level: 'city',
      label: '选择城市',
    },
    {
      level: 'district',
      label: '选择区/县',
    },
  ];
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['district', keywords],
    queryFn: () => fetchDistrict({ keywords }),
  });

  let level,
    currentLabel: any = '',
    listData: any = [];

  if (isSuccess) {
    level = data.districts[0].districts[0]?.level;
    if (level !== 'street') {
      currentLabel = _.find(levelLabels, { level: currentLevel });
      listData = data.districts[0].districts;
    } else {
      const cacheData: any = queryClient.getQueryData([
        'district',
        _.find(district, { level: 'province' }).adcode,
      ]);
      listData = cacheData?.districts[0].districts;
    }
  }

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
      <TouchableOpacity onPress={() => onListItemPressed({ item })}>
        <Text className="p-2">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} className="my-2" />;

  const onClearBtnPressed = () => {
    ref.current?.close();
    onChange(null);
  };

  const onConfirmBtnPressed = () => {
    const provinceData = _.find(district, (item: any) => item.level === 'province');
    const provinceCode = provinceData?.adcode;
    const provinceName = provinceData?.name;
    const cityData = _.find(district, (item: any) => item.level === 'city');
    const cityCode = cityData?.adcode;
    const cityName = cityData?.name;
    const districtData = _.find(district, (item: any) => item.level === 'district');
    const districtCode = districtData?.adcode;
    const districtName = districtData?.name;

    onChange({
      provinceCode,
      provinceName,
      cityCode,
      cityName,
      districtCode,
      districtName,
    });
    ref.current?.close();
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
      <BottomSheetFooter {...props}>
        <HStack
          className="items-center justify-around bg-background-50 p-2"
          style={{ paddingBottom: insets.bottom }}>
          <Button className="flex-1" variant="link" onPress={() => onClearBtnPressed()}>
            <ButtonText>清除</ButtonText>
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
    if (value) {
      const { provinceCode, provinceName, cityCode, cityName, districtCode, districtName } = value;
      const val = [
        {
          level: 'province',
          adcode: provinceCode,
          name: provinceName,
        },
        {
          level: 'city',
          adcode: cityCode,
          name: cityName,
        },
        {
          level: 'district',
          adcode: districtCode,
          name: districtName,
        },
      ];
      setDistrict(val);
    } else {
      const val = [
        {
          level: 'province',
          adcode: null,
          name: null,
        },
        {
          level: 'city',
          adcode: null,
          name: null,
        },
        {
          level: 'district',
          adcode: null,
          name: null,
        },
      ];
      setDistrict(val);
    }
  }, [value]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      {isLoading && <PageSpinner />}
      <VStack className="flex-1 bg-background-100 p-2" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">请选择所在地区</Heading>
          <Divider />
        </VStack>
        <HStack space="md">
          {district?.map((item: any, index: number) => (
            <TouchableOpacity onPress={() => onSelectedBtnPressed({ item })} key={index.toString()}>
              <Text bold={item.level === currentLevel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </HStack>
        <Text bold={true}>{currentLabel?.label}</Text>
        <BottomSheetFlatList
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          data={listData}
          keyExtractor={(item: any) => `${item.name}_${item.adcode}`}
          renderItem={renderItem}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
        />
      </VStack>
    </BottomSheetModal>
  );
});
