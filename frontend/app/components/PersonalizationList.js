import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

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
                    <View style={styles.personalizationItem}>
                        <Checkbox
                            status={selectedPersonalizations.includes(item.personalization.name) ? "checked" : "unchecked"}
                            onPress={() => toggleSelection(item.personalization.name)}
                            color="#007bff"
                        />
                        <Text style={styles.personalizationText}>{item.personalization.name}</Text>
                    </View>
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
        paddingVertical: 8,
    },
    personalizationText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default PersonalizationList;
