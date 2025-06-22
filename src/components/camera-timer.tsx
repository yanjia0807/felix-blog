import { Slider, SliderFilledTrack, SliderTrack } from '@/components/ui/slider';
import React from 'react';

export const CameraTimer: React.FC<any> = React.memo(function CameraTimer({
  recordingTime,
  maxDuration,
}): React.ReactElement {
  return (
    <Slider
      className="absolute top-1/2 w-4/5 flex-1 self-center opacity-70"
      value={recordingTime}
      maxValue={maxDuration}
      size="sm">
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
    </Slider>
  );
});
