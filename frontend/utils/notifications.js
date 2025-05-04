import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import NotificationApiService from '../app/api/NotificationApiService';

// Function to trigger a test notification
export async function triggerTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "This is a test notification to verify notifications are working",
      data: { type: 'test' },
    },
    trigger: { seconds: 2 },
  });
  console.log('Test notification scheduled');
}

// Configure notifications to show when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token = null;

  // Check if device is physical (not emulator)
  if (Device.isDevice) {
    // Check notification permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no permission, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission not granted, return null
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return null;
    }

    // Get Expo push token
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra?.eas?.projectId ?? null,
      })
    ).data;

    // Store token locally
    await AsyncStorage.setItem('pushToken', token);

    // Send token to backend
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        // If user is not logged in, just return the token without registering
        return token;
      }

      // Make sure to include the user token in the authorization header
      const deviceInfo = {
        deviceName: Device.deviceName || 'Unknown',
        osName: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      };

      await NotificationApiService.registerToken(token, deviceInfo);
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Add listener for receiving notifications
export function setupNotifications(setNotification) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      setNotification(notification);
    }
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification tap
      console.log('Notification tapped:', response);

      // You can navigate to specific screens based on notification data here
      // For example, if notification has orderId, navigate to order details
      // This would typically be handled by your app's navigation system
    });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
