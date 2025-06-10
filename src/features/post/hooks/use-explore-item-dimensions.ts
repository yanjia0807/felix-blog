import { imageFormat } from '@/utils/file';
import _ from 'lodash';
import { useWindowDimensions } from 'react-native';

function useExploreItemDimensions({ containerPadding = 14, itemSpacing = 14, attachment }: any) {
  const { width: screenWidth } = useWindowDimensions();

  const itemWidth = (screenWidth - containerPadding * 2 - itemSpacing) / 2;
  let itemHeight = (itemWidth / 9) * 16;

  if (attachment) {
    if (_.startsWith(attachment.mime, 'image')) {
      const format = imageFormat(attachment, 'l', 's');
      const aspectRadio = format.width / format.height;
      itemHeight = Math.min(
        Math.max(itemWidth / aspectRadio, (itemWidth / 3) * 4),
        (itemWidth / 9) * 16,
      );
    }
  }

  return {
    itemWidth,
    itemHeight,
  };
}

export default useExploreItemDimensions;
