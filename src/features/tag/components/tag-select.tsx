import { fetchPopularTags } from '@/api/tag';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { TagSheet } from './tag-sheet';

export const TagSelect = ({ value = [], onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [moreTags, setMoreTags] = useState<any>([]);

  const { data: tags } = useQuery({
    queryKey: ['tags', 'list', 'popular'],
    queryFn: () => fetchPopularTags({ limit: 2 }),
  });
  const allTags = _.unionBy(tags, moreTags, 'id');

  const onTagItemPress = (item: any) => {
    if (_.find(value, (val) => val.id === item.id)) {
      onChange(_.filter(value, (val: any) => val.id !== item.id));
    } else {
      onChange([...value, item]);
    }
  };

  const onShowMore = () => bottomSheetRef.current?.present();

  const onMoreChange = (moreValue: any) => {
    setMoreTags(moreValue);
    onChange(moreValue);
  };

  const onRemoveAll = () => {
    setMoreTags([]);
    onChange([]);
  };

  return (
    <>
      <HStack space="sm" className="flex-wrap">
        {allTags?.map((item: any) => (
          <Button
            onPress={() => onTagItemPress(item)}
            key={item.id}
            size="sm"
            action={_.find(value, (val) => val.id === item.id) ? 'primary' : 'secondary'}
            variant="solid">
            <ButtonText>{item.name}</ButtonText>
          </Button>
        ))}
        <Button
          onPress={onShowMore}
          key={-1}
          size="sm"
          action="secondary"
          variant="link"
          className="ml-3">
          <ButtonText>更多...</ButtonText>
        </Button>
        <Button
          onPress={onRemoveAll}
          key={-2}
          size="sm"
          action="negative"
          variant="link"
          className="ml-3">
          <ButtonText>清空</ButtonText>
        </Button>
      </HStack>
      <TagSheet ref={bottomSheetRef} onChange={onMoreChange} value={value} />
    </>
  );
};
