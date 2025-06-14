import React, { memo } from 'react';
import { SenderImageryItem } from './sender-imagery-item';
import { SenderTextItem } from './sender-text-item';
import { SenderVoiceItem } from './sender-voice-item';

export const SenderItem: React.FC<any> = memo(function SenderItem({ item }) {
  if (item.messageType === 'text') return <SenderTextItem item={item} />;
  else if (item.messageType === 'voice') return <SenderVoiceItem item={item} />;
  else if (item.messageType === 'imagery') return <SenderImageryItem item={item} />;
});
