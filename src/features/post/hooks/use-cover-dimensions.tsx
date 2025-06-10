import { useWindowDimensions } from 'react-native';

function useCoverDimensions(containerPadding: number = 0, cardPadding: number = 0) {
  const { width: screenWidth } = useWindowDimensions();
  const coverWidth = screenWidth - containerPadding * 2 - cardPadding * 2;
  const coverHeight = (coverWidth / 16) * 9;

  return {
    coverWidth,
    coverHeight,
  };
}

export default useCoverDimensions;
