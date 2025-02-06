import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text, Chip, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

// Datos de ejemplo - En producción vendrían de una API
const PRODUCT = {
  id: 1,
  name: 'Tender Box',
  price: 129,
  description: 'Deliciosas tiras de pollo empanizadas acompañadas de papas fritas y tu salsa favorita.',
  ingredients: ['Pechuga de pollo', 'Empanizado especial', 'Papas fritas', 'Salsa a elegir'],
  image: require('../../../assets/products/tenders.png'),
  category: 'Tenders'
};

const SAUCES = ['BBQ', 'Ranch', 'Buffalo', 'Honey Mustard'];

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState('1');
  const [selectedSauce, setSelectedSauce] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddToCart = () => {
    // Implementar lógica para agregar al carrito
    router.push('/cart');
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={PRODUCT.image} />
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall">{PRODUCT.name}</Text>
          <Text variant="titleLarge" style={styles.price}>
            ${PRODUCT.price.toFixed(2)}
          </Text>
          
          <Text variant="bodyLarge" style={styles.description}>
            {PRODUCT.description}
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Ingredientes:
          </Text>
          <View style={styles.ingredients}>
            {PRODUCT.ingredients.map((ingredient, index) => (
              <Chip key={index} style={styles.chip}>
                {ingredient}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Elige tu salsa:
          </Text>
          <View style={styles.sauces}>
            {SAUCES.map((sauce) => (
              <Chip
                key={sauce}
                selected={selectedSauce === sauce}
                onPress={() => setSelectedSauce(sauce)}
                style={styles.chip}
              >
                {sauce}
              </Chip>
            ))}
          </View>

          <TextInput
            mode="outlined"
            label="Cantidad"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            style={styles.quantity}
          />

          <TextInput
            mode="outlined"
            label="Notas especiales"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notes}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleAddToCart}
        style={styles.addButton}
      >
        Agregar al Carrito - ${(PRODUCT.price * parseInt(quantity || '1')).toFixed(2)}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  price: {
    marginVertical: 8,
    color: '#2196F3',
  },
  description: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sauces: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  quantity: {
    marginVertical: 8,
  },
  notes: {
    marginVertical: 8,
  },
  addButton: {
    margin: 16,
  },
}); 