import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, Card, TextInput } from 'react-native-paper';

describe('Componentes UI', () => {
    describe('Button', () => {
        it('debe renderizar el botón con el texto correcto', () => {
            const onPress = jest.fn();
            const { getByText } = render(
                <Button mode="contained" onPress={onPress}>
                    Presionar
                </Button>
            );

            expect(getByText('Presionar')).toBeTruthy();
        });

        it('debe llamar a onPress cuando se presiona', () => {
            const onPress = jest.fn();
            const { getByText } = render(
                <Button mode="contained" onPress={onPress}>
                    Presionar
                </Button>
            );

            fireEvent.press(getByText('Presionar'));
            expect(onPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('Card', () => {
        it('debe renderizar la tarjeta con título y contenido', () => {
            const { getByText } = render(
                <Card>
                    <Card.Title title="Título de la Tarjeta" />
                    <Card.Content>
                        <TextInput
                            label="Campo de texto"
                            value=""
                            onChangeText={() => { }}
                        />
                    </Card.Content>
                </Card>
            );

            expect(getByText('Título de la Tarjeta')).toBeTruthy();
            expect(getByText('Campo de texto')).toBeTruthy();
        });
    });

    describe('TextInput', () => {
        it('debe actualizar el valor cuando se escribe', () => {
            const onChangeText = jest.fn();
            const { getByPlaceholderText } = render(
                <TextInput
                    placeholder="Escribe algo"
                    value=""
                    onChangeText={onChangeText}
                />
            );

            fireEvent.changeText(getByPlaceholderText('Escribe algo'), 'Hola Mundo');
            expect(onChangeText).toHaveBeenCalledWith('Hola Mundo');
        });
    });
}); 