import { HStack } from '@/components/ui/hstack';
import _ from 'lodash';
import { twMerge } from 'tailwind-merge';
import { RecordingIcon } from './recording-icon';

export const RecordingList = ({ value = [], onChange, className = '', readonly = false }: any) => {
  const onRemove = async (uri: string) => {
    onChange(_.filter(value, (item: any) => item.uri !== uri));
  };

  if (value.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {value.map((item: any) => (
          <RecordingIcon key={item.uri} item={item} onRemove={onRemove} readonly={readonly} />
        ))}
      </HStack>
    );
  }
};
