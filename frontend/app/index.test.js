import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import Index from '../screens/Index'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('Index Screen', () => {
    it('renderiza correctamente los elementos principales', () => {
        render(<Index />);
        expect(screen.getByPlaceholderText('Buscar')).toBeTruthy();
        expect(screen.getByText('All')).toBeTruthy();
        expect(screen.getByText('Combos')).toBeTruthy();
        expect(screen.getByText('Bebidas')).toBeTruthy();
        expect(screen.getByText('Complementos')).toBeTruthy();
    });

    it('filtra los productos por categoría', () => {
        render(<Index />);

        fireEvent.press(screen.getByText('Bebidas'));
        expect(screen.queryByText('Tenders')).toBeNull();
        expect(screen.getByText('Limonada')).toBeTruthy();
    });

    it('muestra el modal de filtros al presionar el botón', () => {
        render(<Index />);

        fireEvent.press(screen.getByRole('button', { name: /filter-list/i }));
        expect(screen.getByText('A-Z')).toBeTruthy();
        expect(screen.getByText('Z-A')).toBeTruthy();
        expect(screen.getByText('Más pedidos')).toBeTruthy();
    });

    it('permite escribir en la barra de búsqueda', () => {
        render(<Index />);
        const searchInput = screen.getByPlaceholderText('Buscar');

        fireEvent.changeText(searchInput, 'Burger');
        expect(searchInput.props.value).toBe('Burger');
    });

    it('navega a la página de un producto al hacer clic en él', () => {
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        render(<Index />);
        fireEvent.press(screen.getByText('Tenders'));
        expect(pushMock).toHaveBeenCalledWith('/product/1');
    });
});
