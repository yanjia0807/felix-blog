import React from 'react';
import _ from 'lodash';
import { Button, ButtonText } from '@/components/ui/button';

const TagItem: React.FC<any> = ({ item, index, selectFilterTags, filterTags }) => {
  return (
    <Button
      className={`mx-1 h-8 ${index === 0 && 'ml-0'}`}
      size="sm"
      action={_.includes(filterTags, item.id) ? 'primary' : 'secondary'}
      variant="solid"
      onPress={() => selectFilterTags({ item })}>
      <ButtonText>{item.name}</ButtonText>
    </Button>
  );
};

export default TagItem;
