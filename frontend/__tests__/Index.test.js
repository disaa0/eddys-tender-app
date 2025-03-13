import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Index from '../screens/Index'; // Ajusta la ruta según tu estructura
import { useRouter } from 'expo-router';

// Mock del router de Expo
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Index Screen', () => {
    it('debe renderizar la pantalla correctamente', () => {
        const { getByPlaceholderText, getByText } = render(<Index />);

        // Verificar que la barra de búsqueda está presente
        expect(getByPlaceholderText('Buscar')).toBeTruthy();

        // Verificar que las categorías están presentes
        expect(getByText('All')).toBeTruthy();
        expect(getByText('Combos')).toBeTruthy();
        expect(getByText('Bebidas')).toBeTruthy();
        expect(getByText('Complementos')).toBeTruthy();
    });

    it('debe filtrar productos cuando se selecciona una categoría', () => {
        const { getByText, queryByText } = render(<Index />);

        // Seleccionar la categoría "Bebidas"
        fireEvent.press(getByText('Bebidas'));

        // Verificar que solo los productos de bebidas están visibles
        expect(getByText('Limonada')).toBeTruthy();
        expect(queryByText('Tenders')).toBeNull();
    });

    it('debe abrir la pantalla de un producto cuando se presiona un producto', () => {
        const router = useRouter();
        const { getByText } = render(<Index />);

        // Simular clic en "Tenders"
        fireEvent.press(getByText('Tenders'));

        // Verificar que el router fue llamado con la ruta correcta
        expect(router.push).toHaveBeenCalledWith('/product/1');
    });
});