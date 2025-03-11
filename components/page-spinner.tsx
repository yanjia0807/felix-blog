import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Spinner } from './ui/spinner';

const PageSpinner = ({ isVisiable }: any) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const SPINNER_SIZE = 20;

  return (
    isVisiable && (
      <Spinner
        style={{
          position: 'absolute',
          left: (screenWidth - SPINNER_SIZE) / 2,
          top: (screenHeight - SPINNER_SIZE) / 2,
        }}
      />
    )
  );
};

export default PageSpinner;
