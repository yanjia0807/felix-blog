import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Filter, Search } from 'lucide-react-native';
import { Keyboard } from 'react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import useDebounce from '@/hooks/use-debounce';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { setDebounceKeywords, setKeywords } from '../store';
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
  const dispatch = useAppDispatch();
  const keywords = useAppSelector((state) => state.postFilter.keywords);
  const doSetKeywords = (text) => dispatch(setKeywords(text));
  const debounceKeywords = useDebounce(keywords, 500);

  const onChangeText = (text) => doSetKeywords(text);

  const onSubmitEditing = () => {
    if (outlines.length > 0) {
      router.push(`/posts/${outlines[0].documentId}`);
    }
  };

  useEffect(() => {
    dispatch(setDebounceKeywords(debounceKeywords));
  }, [debounceKeywords]);

  return (
    <Input size="lg" variant="rounded" className="flex-1">
      <InputSlot className="ml-3">
        <InputIcon as={Search} />
      </InputSlot>
      <InputField
        autoFocus={true}
        value={keywords}
        inputMode="text"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        placeholder="搜索帖子..."
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

export default PostFilterInput;
