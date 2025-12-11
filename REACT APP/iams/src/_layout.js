import { Stack } from "expo-router";
import { AuthProvider } from "../context/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        {/* App */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mark/[id]" />
        <Stack.Screen name="success/index" />
      </Stack>
    </AuthProvider>
  );
}
