import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { theme } from '../theme';

const PersonalizationList = ({ personalizations, selectedPersonalizations, setSelectedPersonalizations, setShowPersonalizations }) => {
    const toggleSelection = (name) => {
        if (selectedPersonalizations.includes(name)) {
            setSelectedPersonalizations(selectedPersonalizations.filter(item => item !== name));
        } else {
            setSelectedPersonalizations([...selectedPersonalizations, name]);
        }
    };

    return (
        <View style={styles.container}>
            {/* Botón de cerrar */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPersonalizations(false)}>
                <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>

            <Text style={styles.title}>Personalizaciones</Text>

            {/* Lista de personalizaciones */}
            <FlatList
                data={personalizations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.personalizationItem}
                        onPress={() => toggleSelection(item.personalization.name)}
                    >
                        {selectedPersonalizations.includes(item.personalization.name) ? (
                            <Ionicons name="checkbox" size={24} color={theme.colors.primary} />
                        ) : (
                            <Ionicons name="square-outline" size={24} color="#aaa" />
                        )}
                        <Text style={styles.personalizationText}>{item.personalization.name}</Text>
                    </TouchableOpacity>

                )}

            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: '80%',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    personalizationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 8,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    personalizationText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default PersonalizationList;
