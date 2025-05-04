import React, { useState, useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync, setupNotifications } from '../utils/notifications';
import { Text } from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationApiService from '../app/api/NotificationApiService';
import { useRouter } from 'expo-router';

/**
 * Component to handle push notifications registration and handling
 * This component doesn't render anything visible but handles notification logic
 */
export default function NotificationHandler() {
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const { isAuthenticated } = useAuth();
  const prevAuthState = useRef(isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    const handleAuthChange = async () => {
      // If user has logged in (previous state was false, current state is true)
      if (!prevAuthState.current && isAuthenticated) {
        console.log('User logged in, registering for notifications...');
        try {
          await registerForPushNotificationsAsync();
        } catch (err) {
          console.log('Failed to register for notifications', err);
        }
      }
      // If user has logged out (previous state was true, current state is false)
      else if (prevAuthState.current && !isAuthenticated) {
        console.log('User logged out, unregistering notifications...');
        try {
          // Get the push token
          const pushToken = await AsyncStorage.getItem('pushToken');
          
          // We won't try to unregister here since it would fail without a userToken
          // This is now handled in the AuthService.logout() method
          
          // Only remove token from local storage
          if (pushToken) {
            await AsyncStorage.removeItem('pushToken');
          }
        } catch (err) {
          console.log('Error unregistering notifications on logout', err);
        }
      }
      
      // Update previous auth state reference
      prevAuthState.current = isAuthenticated;
    };

    handleAuthChange();
    
    // Set up notification listeners if user is authenticated
    let cleanup = () => {};
    if (isAuthenticated) {
      cleanup = setupNotifications(setNotification);
    }
    
    // Return cleanup function to remove listeners when component unmounts or auth state changes
    return cleanup;
  }, [isAuthenticated]); // Re-run when authentication status changes

  // When a notification is received, you can perform actions here
  useEffect(() => {
    if (notification) {
      console.log('Notification received:', notification);
      // Here you can handle the notification, e.g., show a toast or navigate to a screen
    }
  }, [notification]);

  // Check for tapped notifications that require navigation
  useEffect(() => {
    const checkForTappedNotification = async () => {
      try {
        // Check if we have a stored notification that was tapped
        const lastNotificationJson = await AsyncStorage.getItem('lastTappedNotification');
        
        if (lastNotificationJson) {
          const lastNotification = JSON.parse(lastNotificationJson);
          const now = new Date();
          const notificationTime = new Date(lastNotification.timestamp);
          
          // Only process notifications that are less than 30 seconds old to avoid
          // handling old notifications on app startup
          const timeDiffSeconds = (now - notificationTime) / 1000;
          
          if (timeDiffSeconds < 30) {
            console.log('Processing tapped notification:', lastNotification.data);
            
            // Handle navigation based on notification data
            if (lastNotification.data.screen) {
              if (lastNotification.data.params) {
                console.log(`Navigating to ${lastNotification.data.screen} with params:`, lastNotification.data.params);
                router.push({
                  pathname: lastNotification.data.screen,
                  params: lastNotification.data.params
                });
              } else {
                console.log(`Navigating to ${lastNotification.data.screen}`);
                router.push(lastNotification.data.screen);
              }
            } else if (lastNotification.data.orderId) {
              // Special case for orders
              const userType = lastNotification.data.userType || 'customer';
              const screen = userType === 'admin' 
                ? `/(appAdmin)/orders/${lastNotification.data.orderId}`
                : `/(app)/orders/${lastNotification.data.orderId}`;
              
              console.log(`Navigating to order screen: ${screen}`);
              router.push(screen);
            }
            
            // Clear the processed notification
            await AsyncStorage.removeItem('lastTappedNotification');
          } else {
            // Clean up old notifications
            await AsyncStorage.removeItem('lastTappedNotification');
          }
        }
      } catch (err) {
        console.error('Error processing tapped notification:', err);
      }
    };
    
    checkForTappedNotification();
  }, [router]);

  // This component doesn't render anything visible
  return null;
}
