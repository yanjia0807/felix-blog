import { Button, ButtonText } from '@/components/ui/button';
import { useFilterTags, usePostExploreActions } from '@/features/post/store/use-post-explore-store';
import _ from 'lodash';
import React, { memo } from 'react';

const TagItem: React.FC<any> = memo(function TagItem({ item, index }) {
  const filterTags = useFilterTags();
  const { selectTag } = usePostExploreActions();
  const onPress = (tagId) => selectTag(tagId);

  return (
    <Button
      className={`mx-1 h-8 ${index === 0 && 'ml-0'}`}
      size="sm"
      action={_.includes(filterTags, item.id) ? 'primary' : 'secondary'}
      variant="solid"
      onPress={() => onPress(item.id)}>
      <ButtonText>{item.name}</ButtonText>
    </Button>
  );
});

export default TagItem;
