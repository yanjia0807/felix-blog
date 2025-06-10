import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDistance = (date: Date) => {
  const now = new Date();

  if (new Date(date).getTime() > now.getTime() - 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
  }

  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};
