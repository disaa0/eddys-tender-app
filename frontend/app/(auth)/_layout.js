import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{
          title: "Iniciar Sesión",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: "Registro",
          headerShown: true,
        }} 
      />
    </Stack>
  );
} 