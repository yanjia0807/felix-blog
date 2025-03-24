import { BackButton } from '@/components/header';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { Stack } from 'expo-router';

export default function Layout(props: any) {
  return (
    <OverlayProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            presentation: 'modal',
          }}>
          {props.children}
        </Stack>
      </ToastProvider>
    </OverlayProvider>
  );
}
