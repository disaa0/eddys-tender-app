import { FlatList, FlatListComponent, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { theme } from '../theme';

export default function CategoryChips({ categories, selectedCategory, onSelect }) {
  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categories}
      renderItem={({ item }) => (
        <Chip
          selected={selectedCategory === item}
          onPress={() => onSelect(item)}
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
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexGrow: 0,
    backgroundColor: theme.colors.surface,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    height: 36,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedChipText: {
    color: '#fff',
  },
}); 