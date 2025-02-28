import { FlatList, FlatListComponent, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { theme } from '../theme';

export default function SortChips({ categories, selectedCategory, onSelect }) {
    return (
        <FlatList
            data={categories}
            style={styles.categories}
            renderItem={({ item }) => (
                <Chip
                    selected={selectedCategory === item}
                    onPress={() => onSelect(item)}
                    icon=''
                    style={[styles.chip, selectedCategory === item && styles.selectedChip]}
                    textStyle={[
                        styles.chipText,
                        selectedCategory === item && styles.selectedChipText
                    ]}
                >
                    {item}
                </Chip>
            )}
        />
    );
}

const styles = StyleSheet.create({
    categories: {
        backgroundColor: '#F5F5F5',
        borderRadius: 13,
        textAlign: 'center'
    },
    chip: {
        backgroundColor: '#F5F5F5',
        height: 40,

    },
    selectedChip: {
        backgroundColor: theme.colors.primary,
    },
    chipText: {
        fontSize: 16,
        color: '#666',
        width: '100%',
        textAlign: 'center'
    },
    selectedChipText: {
        color: '#fff',
    },
}); 