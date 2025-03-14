import { renderHook, act } from '@testing-library/react-hooks';
import { useUserInfo } from '../app/hooks/useUserInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe('Hooks Personalizados', () => {
    describe('useUserInfo', () => {
        beforeEach(() => {
            // Limpiar todos los mocks antes de cada prueba
            jest.clearAllMocks();
        });

        it('debe inicializar con valores por defecto', () => {
            const { result } = renderHook(() => useUserInfo());

            expect(result.current.user).toBeNull();
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeNull();
        });

        it('debe cargar datos del usuario desde AsyncStorage', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@test.com'
            };
            AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

            const { result } = renderHook(() => useUserInfo());

            // Esperar a que se complete la carga inicial
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('debe manejar errores al cargar datos', async () => {
            AsyncStorage.getItem.mockRejectedValue(new Error('Error de carga'));

            const { result } = renderHook(() => useUserInfo());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe('Error de carga');
        });

        it('debe actualizar datos del usuario', async () => {
            const { result } = renderHook(() => useUserInfo());

            const newUser = {
                id: 1,
                name: 'Nuevo Usuario',
                email: 'nuevo@test.com'
            };

            await act(async () => {
                await result.current.updateUser(newUser);
            });

            expect(result.current.user).toEqual(newUser);
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'userInfo',
                JSON.stringify(newUser)
            );
        });

        it('debe cerrar sesión correctamente', async () => {
            const { result } = renderHook(() => useUserInfo());

            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.user).toBeNull();
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userInfo');
        });
    });
}); 