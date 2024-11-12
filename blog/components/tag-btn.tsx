import React from 'react';
import { ButtonGroup, Button, ButtonIcon, ButtonText } from './ui/button';
import { X } from 'lucide-react-native';

const TagBtn = ({ tag, removeTag }: any) => {
  return (
    <ButtonGroup space="xs" isAttached={true} className="m-1">
      <Button action="secondary" variant="outline" size="xs" key={tag.id} className="rounded-xl">
        <ButtonText>{tag.name}</ButtonText>
        {removeTag && <ButtonIcon as={X} onPress={() => removeTag(tag)}></ButtonIcon>}
      </Button>
    </ButtonGroup>
  );
};

export default TagBtn;
