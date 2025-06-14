import React, { memo } from 'react';
import { ReceiverImageryItem } from './receiver-imagery-item';
import { ReceiverTextItem } from './receiver-text-item';
import { ReceiverVoiceItem } from './receiver-voice-item';

export const ReceiverItem: React.FC<any> = memo(function ReceiverItem({ item, otherUser }) {
  if (item.messageType === 'text') return <ReceiverTextItem item={item} otherUser={otherUser} />;
  else if (item.messageType === 'voice')
    return <ReceiverVoiceItem item={item} otherUser={otherUser} />;
  else if (item.messageType === 'imagery') return <ReceiverImageryItem item={item} />;
});
