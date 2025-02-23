import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, IconButton, Avatar } from 'react-native-paper';
import { useState } from 'react';
import { theme } from '../theme';

// Datos de ejemplo - En producción vendrían de una API/Backend
const CHAT_HISTORY = [
  {
    id: 1,
    message: "Hola, ¿en qué puedo ayudarte?",
    sender: "admin",
    timestamp: "10:30",
  },
  {
    id: 2,
    message: "Hola, pedí dos hamburguesas de pollo frito. ¿Puedo saber cuánto tardará en llegar?",
    sender: "user",
    timestamp: "10:31",
  },
  {
    id: 3,
    message: "Ok, ¡por favor déjame comprobarlo!",
    sender: "admin",
    timestamp: "10:31",
  },
];

export default function Support() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // Implementar lógica de envío de mensaje
      setMessage('');
    }
  };

  const renderMessage = (item) => {
    const isUser = item.sender === 'user';

    return (
      <View
        key={item.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.adminMessage,
        ]}
      >
        {!isUser && (
          <Avatar.Icon 
            size={32} 
            icon="account" 
            style={styles.avatar}
            color="white"
            backgroundColor={theme.colors.primary}
          />
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.adminBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.adminText]}>
            {item.message}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.welcomeTitle}>
              ¡Bienvenido al Soporte de Eddy's!
            </Text>
            <Text variant="bodyMedium">
              Estamos aquí para ayudarte con cualquier duda o problema.
            </Text>
          </Card.Content>
        </Card>

        {CHAT_HISTORY.map(renderMessage)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Escribe tu mensaje..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          multiline
          right={
            <TextInput.Icon
              icon="send"
              color={theme.colors.primary}
              onPress={handleSend}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  welcomeTitle: {
    color: theme.colors.primary,
    marginBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  adminMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  adminText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
}); 