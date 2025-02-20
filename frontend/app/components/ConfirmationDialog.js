import { Portal, Dialog, Button, Text } from 'react-native-paper';
import { theme } from '../theme';

export default function ConfirmationDialog({
    visible,
    onDismiss,
    onConfirm,
    title,
    message,
    confirmButtonDisabled = false,
    confirmButtonLoading = false
}) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">{message}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={onDismiss}
                        disabled={confirmButtonLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onPress={onConfirm}
                        textColor={theme.colors.error}
                        disabled={confirmButtonDisabled}
                        loading={confirmButtonLoading}
                    >
                        Eliminar
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
} 