import { Button, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import useDebounce from '@/hooks/use-debounce';
import { useRouter } from 'expo-router';
import { Filter, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { usePostFilterActions } from '../store/use-post-filter-store';
import { usePostDrawerContext } from './post-drawer-provider';

const FilterIcon: React.FC<any> = () => {
  const { open } = usePostDrawerContext();
  const handleOpen = () => {
    Keyboard.dismiss();
    open();
  };
  return (
    <Button variant="link" action="secondary" onPress={handleOpen} pointerEvents="box-only">
      <ButtonIcon as={Filter} className="text-secondary-900" />
    </Button>
  );
};

export const PostFilterInput: React.FC<any> = ({ outlines, isLoading }) => {
  const router = useRouter();
  const [keywords, setKeywords] = useState('');
  const { setDebounceKeywords } = usePostFilterActions();

  const debounce = useDebounce(keywords, 500);

  const onChangeText = (text) => setKeywords(text);

  const onSubmitEditing = () => {
    if (outlines.length > 0) {
      router.push(`/posts/${outlines[0].documentId}`);
    }
  };

  useEffect(() => {
    setDebounceKeywords(debounce);
  }, [debounce, setDebounceKeywords]);

  return (
    <Input variant="rounded" className="flex-1">
      <InputSlot className="ml-3">
        <InputIcon as={Search} />
      </InputSlot>
      <InputField
        autoFocus={true}
        autoCorrect={false}
        autoCapitalize="none"
        inputMode="text"
        returnKeyType="search"
        placeholder="搜索帖子..."
        value={keywords}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
      {isLoading && (
        <InputSlot className="mx-3">
          <InputIcon as={Spinner} />
        </InputSlot>
      )}
      <InputSlot className="mx-3">
        <InputIcon as={FilterIcon} />
      </InputSlot>
    </Input>
  );
};
