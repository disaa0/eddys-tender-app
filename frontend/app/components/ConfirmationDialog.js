import { Portal, Dialog, Button, Text } from 'react-native-paper';
import { theme } from '../theme';
import { StyleSheet } from 'react-native';

export default function ConfirmationDialog({
    visible,
    onDismiss,
    onConfirm,
    title,
    message,
    confirmButtonDisabled = false,
    confirmButtonLoading = false,
    cancelButtonLabel = 'Cancelar',
    confirmButtonLabel = 'Eliminar'
}) {
    return (
        <Portal>
            <Dialog style={styles.container} visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">{message}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={onDismiss}
                        disabled={confirmButtonLoading}
                    >
                        {cancelButtonLabel}
                    </Button>
                    <Button
                        onPress={onConfirm}
                        textColor={theme.colors.error}
                        disabled={confirmButtonDisabled}
                        loading={confirmButtonLoading}
                    >
                        {confirmButtonLabel}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 30,
    },
})