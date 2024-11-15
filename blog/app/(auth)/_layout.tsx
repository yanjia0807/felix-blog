import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { Stack } from 'expo-router';

export default function Layout(props: any) {
  return (
    <OverlayProvider>
      <ToastProvider>
        <Stack>{props.children}</Stack>
      </ToastProvider>
    </OverlayProvider>
  );
}
