import { Stack } from "expo-router";
import { AccountProvider } from "./context/AccountContext";

export default function RootLayout() {
  return (
    <AccountProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddAccount"
          options={{ headerShown: false }}
        />
      </Stack>
    </AccountProvider>
  );
}
