import React, { useState } from 'react';
import { View } from 'react-native';
import RNPagerView from 'react-native-pager-view';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Portal } from '@/components/ui/portal';
import { FileTypeNum } from '@/utils/file';
import { ImagePage } from './image-page';
import { usePagerView } from './pager-view-provider';
import { VideoPage } from './video-page';

export const PageContent: React.FC<any> = ({ item, pageNum, isVisible, toggleVisible }) => {
  return (
    <View className="w-full flex-1">
      {item.fileType === FileTypeNum.Image ? (
        <ImagePage
          item={item}
          pageNum={pageNum}
          isVisible={isVisible}
          toggleVisible={toggleVisible}
        />
      ) : (
        <VideoPage
          item={item}
          pageNum={pageNum}
          isVisible={isVisible}
          toggleVisible={toggleVisible}
        />
      )}
    </View>
  );
};

export const PagerView: React.FC<any> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([]));
  const { pageIndex, pages, onClose, isOpen } = usePagerView();

  const onPageSelected = (e: any) => {
    const position = e.nativeEvent.position;
    const loaded = new Set(loadedPages);
    [position - 1, position, position + 1].forEach((index) => {
      if (index >= 0 && index < pages.length) {
        loaded.add(index);
      }
    });
    setLoadedPages(loaded);
  };

  const onPageScroll = (e: any) => {
    if (e.nativeEvent.position < 0 || e.nativeEvent.position === pages.length) {
      onClose();
    }
  };

  const toggleVisible = () => setIsVisible((val) => !val);

  return (
    <Portal isOpen={isOpen} style={{ flex: 1 }} useRNModal={true}>
      <Animated.View
        entering={FadeIn.duration(100)}
        exiting={FadeOut.duration(100)}
        className="flex-1 bg-background-50">
        <RNPagerView
          style={{ flex: 1 }}
          initialPage={pageIndex}
          overdrag={true}
          overScrollMode="always"
          pageMargin={20}
          onPageSelected={onPageSelected}
          onPageScroll={onPageScroll}>
          {pages.map((item: any, index: number) => {
            return (
              <View className="flex-1" key={index}>
                {loadedPages.has(index) ? (
                  <PageContent
                    item={item}
                    pageNum={index + 1}
                    isVisible={isVisible}
                    toggleVisible={toggleVisible}
                  />
                ) : (
                  <></>
                )}
              </View>
            );
          })}
        </RNPagerView>
      </Animated.View>
    </Portal>
  );
};
