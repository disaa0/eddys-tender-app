import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Iniciar Sesión",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Registro",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="registerSuccesful"
        options={{
          title: "Registro éxito",
          headerShown: false,
        }}
      />
    </Stack>
  );
} 