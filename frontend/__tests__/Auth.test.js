import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Login from '../app/(auth)/login';
import Register from '../app/(auth)/register';

// Mock del router de Expo
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe('Componentes de Autenticación', () => {
    describe('Login', () => {
        it('debe renderizar el formulario de login correctamente', () => {
            const { getByPlaceholderText, getByText } = render(<Login />);

            expect(getByPlaceholderText('Email')).toBeTruthy();
            expect(getByPlaceholderText('Contraseña')).toBeTruthy();
            expect(getByText('Iniciar Sesión')).toBeTruthy();
        });

        it('debe mostrar error con credenciales inválidas', async () => {
            const { getByPlaceholderText, getByText } = render(<Login />);

            fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrongpassword');
            fireEvent.press(getByText('Iniciar Sesión'));

            await waitFor(() => {
                expect(getByText('Credenciales inválidas')).toBeTruthy();
            });
        });
    });

    describe('Register', () => {
        it('debe renderizar el formulario de registro correctamente', () => {
            const { getByPlaceholderText, getByText } = render(<Register />);

            expect(getByPlaceholderText('Nombre')).toBeTruthy();
            expect(getByPlaceholderText('Email')).toBeTruthy();
            expect(getByPlaceholderText('Contraseña')).toBeTruthy();
            expect(getByPlaceholderText('Confirmar Contraseña')).toBeTruthy();
            expect(getByText('Registrarse')).toBeTruthy();
        });

        it('debe validar que las contraseñas coincidan', async () => {
            const { getByPlaceholderText, getByText } = render(<Register />);

            fireEvent.changeText(getByPlaceholderText('Nombre'), 'Test User');
            fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('Contraseña'), 'password123');
            fireEvent.changeText(getByPlaceholderText('Confirmar Contraseña'), 'password456');
            fireEvent.press(getByText('Registrarse'));

            await waitFor(() => {
                expect(getByText('Las contraseñas no coinciden')).toBeTruthy();
            });
        });
    });
}); 