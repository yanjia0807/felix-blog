import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useMemo, useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { MapView, Marker } from 'react-native-amap3d';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiServerURL } from '@/api';
import { fetchPositionRound } from '@/api/amap';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

const mockData = [
  {
    adcode: '500113',
    address: '李家沱马王坪正街',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '20',
    id: 'B00178230Q',
    location: '106.536874,29.468220',
    name: '映江花园',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '商务住宅;住宅区;住宅小区',
    typecode: '120302',
  },
  {
    adcode: '500113',
    address: '马王坪正街与工矿路交叉口东北100米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '89',
    id: 'B0KURKVICH',
    location: '106.536835,29.467235',
    name: '枫桥夜泊茶楼',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;茶艺馆;茶艺馆',
    typecode: '050600',
  },
  {
    adcode: '500113',
    address: '马王坪新村2号附4号(庆丰花园内)',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '90',
    id: 'B001793ZBO',
    location: '106.536588,29.467267',
    name: '舒展盲人按摩',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;洗浴推拿场所;洗浴推拿场所',
    typecode: '071400',
  },
  {
    adcode: '500113',
    address: '马王坪正街与工矿路交叉口东北100米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '96',
    id: 'B0K06K5KME',
    location: '106.536825,29.467175',
    name: '柒佬贰·猪肉炖粉条米饭',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;中餐厅',
    typecode: '050100',
  },
  {
    adcode: '500113',
    address: '马王坪后街28号马王坪新村',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '96',
    id: 'B0FFFYGCOV',
    location: '106.536978,29.467171',
    name: '庆丰烧鸡公酸菜鸡(马王坪新村店)',
    parent: 'B0FFHMCCB9',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;中餐厅',
    typecode: '050100',
  },
  {
    adcode: '500113',
    address: '马王坪正街马王坪新村2号附6-7号',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '97',
    id: 'B0FFFDZSTP',
    location: '106.536750,29.467174',
    name: '偷渡老火锅(马王坪新村店)',
    parent: 'B0FFHMCCB9',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;火锅店',
    typecode: '050117',
  },
  {
    adcode: '500113',
    address: '李家沱马王坪庆丰花园',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '98',
    id: 'B0FFF2X0KD',
    location: '106.537087,29.467172',
    name: '杨记烧鸡公(李家沱店)',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;中餐厅',
    typecode: '050100',
  },
  {
    adcode: '500113',
    address: '马王坪正街与工矿路交叉口东北120米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '99',
    id: 'B0K6X73P05',
    location: '106.537119,29.467172',
    name: '好幸运辣椒炒肉滑肉汤',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;中餐厅',
    typecode: '050100',
  },
  {
    adcode: '500113',
    address: '重庆市李家沱街道马王坪新村2号附1号庆丰物管旁',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '102',
    id: 'B0GRXC8333',
    location: '106.536468,29.467188',
    name: '菜鸟驿站(映江花园店)',
    parent: 'B00178230Q',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;物流速递;物流速递',
    typecode: '070500',
  },
  {
    adcode: '500113',
    address: '马王坪正街与工矿路交叉口东北120米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '108',
    id: 'B0FFK2IEAG',
    location: '106.537332,29.467149',
    name: '舒乐保健按摩(马王坪正街)',
    parent: 'B00178230Q',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;洗浴推拿场所;洗浴推拿场所',
    typecode: '071400',
  },
  {
    adcode: '500113',
    address: '马王坪正街与马王坪后街交叉口西北120米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '114',
    id: 'B0JU49C9TU',
    location: '106.537939,29.467578',
    name: '完美服务中心',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;生活服务场所;生活服务场所',
    typecode: '070000',
  },
  {
    adcode: '500113',
    address: '马王坪烟草公司背后',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '116',
    id: 'B0FFGALJ4L',
    location: '106.537506,29.467146',
    name: '怡宝桶装水(映江花园店)',
    parent: 'B00178230Q',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;生活服务场所;生活服务场所|购物服务;购物相关场所;购物相关场所',
    typecode: '070000|060000',
  },
  {
    adcode: '500113',
    address: '马王坪正街与工矿路交叉口东北140米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '117',
    id: 'B0FFGW6TJV',
    location: '106.537555,29.467163',
    name: '金发屋(马王坪正街店)',
    parent: 'B00178230Q',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;美容美发店;美容美发店',
    typecode: '071100',
  },
  {
    adcode: '500113',
    address: '李家沱马王坪正街22号庆丰花园',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '120',
    id: 'B0KUNY63VT',
    location: '106.536823,29.466957',
    name: '好对康干洗店',
    parent: 'B00178TWMZ',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;洗衣店;洗衣店',
    typecode: '071500',
  },
  {
    adcode: '500113',
    address: '马王坪后街28号',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '121',
    id: 'B0FFHMCCB9',
    location: '106.537671,29.467192',
    name: '马王坪新村',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '商务住宅;商务住宅相关;商务住宅相关',
    typecode: '120000',
  },
  {
    adcode: '500113',
    address: '马王坪正街与马王坪后街交叉口北120米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '121',
    id: 'B0K2NPZM4R',
    location: '106.538006,29.467544',
    name: '袁记盖饭',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '餐饮服务;中餐厅;中餐厅',
    typecode: '050100',
  },
  {
    adcode: '500113',
    address: '马王坪正街与马王坪后街交叉口西北100米',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '122',
    id: 'B0J2G9IVXY',
    location: '106.537739,29.467231',
    name: '宏顺按摩',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;洗浴推拿场所;洗浴推拿场所',
    typecode: '071400',
  },
  {
    adcode: '500113',
    address: '马王坪正街22号附29号',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '123',
    id: 'B001793BQI',
    location: '106.536737,29.466937',
    name: '得时康干洗店(马王坪正街店)',
    parent: 'B00178TWMZ',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;洗衣店;洗衣店',
    typecode: '071500',
  },
  {
    adcode: '500113',
    address: '马王坪正街22号附26号',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '123',
    id: 'B0FFHPASF1',
    location: '106.536892,29.466927',
    name: '老夏修补店',
    parent: 'B00178TWMZ',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;维修站点;维修站点',
    typecode: '071200',
  },
  {
    adcode: '500113',
    address: '重庆市李家沱街道马王坪新村5号附3号',
    adname: '巴南区',
    citycode: '023',
    cityname: '重庆市',
    distance: '123',
    id: 'B0FFKBW1PN',
    location: '106.537998,29.467491',
    name: '菜鸟驿站(马王坪正街店)',
    parent: '',
    pcode: '500000',
    pname: '重庆市',
    type: '生活服务;物流速递;物流速递',
    typecode: '070500',
  },
];

const UserMarker = ({ coordinate }: any) => {
  const { user } = useAuth();
  return (
    <Marker
      position={{
        latitude: 29.468108452690974,
        longitude: 106.53686740451388,
      }}>
      <Avatar size="sm">
        <AvatarImage
          source={{
            uri: `${apiServerURL}/${user?.profile?.avatar?.formats.thumbnail.url}`,
          }}
        />
      </Avatar>
    </Marker>
  );
};

const PostPositionSheet = forwardRef(function LocationSheet({ onChange }: any, ref: any) {
  const insets = useSafeAreaInsets();
  const [position, setPosition] = useState<Position | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['position'],
    queryFn: fetchPositionRound,
    initialPageParam: {
      location: `${position?.coords.latitude},${position?.coords.longitude}`,
      page_num: 1,
      page_size: 5,
    },
    getNextPageParam: (lastPage: any, pages: any, lastPageParam: any) => {
      if (lastPage.count === '0') {
        return undefined;
      }
      return {
        location: lastPageParam.location,
        page_num: lastPageParam['page_num'] + 1,
        page_size: lastPageParam['page_size'],
      };
    },
    enabled: !!position,
  });

  useEffect(() => {
    const initLocation = async () => {
      await init({
        ios: process.env['EXPO_PUBLIC_AMAP_IOS_KEY'] as string,
        android: '',
      });

      Geolocation.getCurrentPosition(
        (position: Position) => {
          console.log('position', position);
          setPosition(position);
        },
        (error: PositionError) => {
          console.error(error);
        },
      );
    };

    initLocation();
  }, []);

  const places = useMemo(() => {
    if (data)
      return _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.pois], []);
  }, [data]);

  const initialCameraPosition = useMemo(() => {
    return position
      ? {
          initialCameraPosition: {
            target: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            zoom: 11,
          },
        }
      : { zoom: 11 };
  }, [position]);

  const onSelectBtnPressed = (item: any) => {
    onChange(item);
    ref.current?.close();
  };

  const renderPositionItem = ({ item }: any) => (
    <Pressable className="p-2" onPress={() => onSelectBtnPressed(item)}>
      <Text size="md" bold={true}>
        {item.name}
      </Text>
      <Text size="sm">{item.address}</Text>
      <Divider></Divider>
    </Pressable>
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        pressBehavior="none"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      index={-1}
      snapPoints={['50%']}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      ref={ref}>
      <BottomSheetView className="flex-1 m-4">
        <VStack className="flex-1" space="md">
          <Box className="h-1/3">
            <MapView
              onPress={({ nativeEvent }) => console.log('onPress', nativeEvent)}
              onCameraIdle={({ nativeEvent }) => console.log('onCameraIdle', nativeEvent)}
              onLocation={({ nativeEvent }) => console.log('onLocation', nativeEvent)}
              compassEnabled={false}
              myLocationEnabled={true}
              {...initialCameraPosition}>
              <UserMarker coordinate={position} />
            </MapView>
          </Box>
          <Box className="flex-1">
            <BottomSheetFlashList
              // data={places}
              data={mockData}
              keyExtractor={(item: any) => item.id}
              estimatedItemSize={70}
              renderItem={renderPositionItem}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => {
                    if (!isLoading) {
                      refetch();
                    }
                  }}
                />
              }
            />
          </Box>
        </VStack>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default PostPositionSheet;
