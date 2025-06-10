import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <OverlayProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </OverlayProvider>
  );
}
