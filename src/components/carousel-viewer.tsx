import { Portal } from '@/components/ui/portal';
import { VStack } from '@/components/ui/vstack';
import _ from 'lodash';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { remapProps } from 'react-native-css-interop';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCarousel } from './carousel-provider';
import ImageViewer from './image-viewer';
import VideoViewer from './video-viewer';

const CustomPagination = remapProps(Pagination.Basic, {
  containerClassName: 'containerStyle',
  dotClassName: 'dotStyle',
  activeDotClassName: 'activeDotStyle',
});

const CarouselViewer: React.FC<any> = () => {
  const { data, isOpen, index, onClose } = useCarousel();
  const progress = useSharedValue<number>(index);
  const ref = React.useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const renderItem = ({ item }: any) =>
    _.startsWith(item.mime, 'image') ? (
      <ImageViewer item={item} onClose={onClose} />
    ) : (
      <VideoViewer item={item} onClose={onClose} />
    );

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const onProgressChange = (_, absoluteProgress) => {
    progress.value = absoluteProgress;
  };

  return (
    <Portal isOpen={isOpen} style={{ flex: 1 }}>
      <VStack
        className="bg-background-0"
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        space="md">
        <Carousel
          ref={ref}
          width={windowWidth}
          containerStyle={{ flex: 1 }}
          onProgressChange={onProgressChange}
          snapEnabled={true}
          pagingEnabled={true}
          data={data}
          defaultIndex={index}
          renderItem={renderItem}
        />
        <CustomPagination
          progress={progress}
          data={_.map(data, (_, i) => ({ index: i }))}
          onPress={onPressPagination}
          containerClassName="gap-2"
          dotClassName="bg-typography-500 rounded-full"
          activeDotClassName="color-tertiary-500 rounded-full"
        />
      </VStack>
    </Portal>
  );
};

export default CarouselViewer;
