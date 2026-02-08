# Firebase Notifications Integration Guide

## Overview

This app now has full Firebase Cloud Messaging (FCM) integration for push notifications. The system supports:

- ✅ Push notifications (foreground, background, and killed state)
- ✅ Notification badges with unread count
- ✅ Local notification storage and management
- ✅ Notification click handling with deep linking
- ✅ Topic-based notifications
- ✅ Real-time notification UI updates across all screens

## Architecture

### Core Components

1. **notificationService.js** - Handles FCM setup, permissions, tokens, and listeners
2. **NotificationContext.js** - Manages notification state across the app
3. **notificationTestUtils.js** - Testing utilities for development

### Features Implemented

- Automatic FCM token generation and storage
- Notification permission handling
- Foreground notification display
- Background notification handling
- Notification click navigation
- Real-time unread count badges
- Notification history with read/unread status
- Mark as read functionality
- Clear notifications

## Setup Instructions

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Navigate to Project Settings → Cloud Messaging
4. Note your **Server Key** (for backend integration)

### 2. Android Configuration (Already Done)

✅ `google-services.json` is already in place
✅ Android permissions configured in `app.json`
✅ Firebase packages installed

### 3. Backend Integration

To send notifications from your backend, use this endpoint:

```bash
POST https://fcm.googleapis.com/fcm/send
Headers:
  Authorization: key=YOUR_SERVER_KEY
  Content-Type: application/json

Body:
{
  "to": "USER_FCM_TOKEN",
  "notification": {
    "title": "Notification Title",
    "body": "Notification Message"
  },
  "data": {
    "screen": "/quiz",
    "quizId": "123",
    "customData": "any value"
  }
}
```

### 4. Testing Notifications

#### Method 1: Firebase Console (Easiest)

1. Run your app
2. Check console logs for your FCM token
3. Go to Firebase Console → Cloud Messaging → Send Test Message
4. Enter the FCM token
5. Send the notification

#### Method 2: Using Test Utils

```javascript
import { logFCMToken, testNotificationTypes, sendTestNotification } from './lib/notificationTestUtils';

// Log FCM token
await logFCMToken();

// Use predefined test notifications
console.log(testNotificationTypes.quiz);
```

#### Method 3: Using curl

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test message"
    }
  }'
```

## Notification Data Format

### Standard Notification

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message content"
  },
  "data": {
    "type": "quiz|achievement|rank|job|reminder",
    "screen": "/quiz or /allquiz or /leaderboards etc",
    "quizId": "123"
  }
}
```

### Navigation Handling

Notifications can include navigation data:

- `data.screen` - Navigate to specific screen (e.g., "/quiz", "/allquiz")
- `data.quizId` - Open specific quiz
- App will automatically navigate when notification is tapped

## API Integration

### Sending FCM Token to Your Backend

When user logs in, send their FCM token:

```javascript
// In your login/signup flow
import notificationService from './lib/notificationService';

const token = await notificationService.getFCMToken();

// Send to your backend
await api.post('/api/users/fcm-token', {
  userId: currentUser.id,
  fcmToken: token,
});
```

### Backend Endpoint Example (Spring Boot)

```java
@PostMapping("/api/users/fcm-token")
public ResponseEntity<?> updateFCMToken(@RequestBody FcmTokenRequest request) {
    // Store FCM token in user profile
    userService.updateFcmToken(request.getUserId(), request.getFcmToken());
    return ResponseEntity.ok().build();
}
```

### Sending Notification from Backend

```java
import com.google.firebase.messaging.*;

public void sendQuizNotification(String fcmToken, Long quizId, String quizTitle) {
    Message message = Message.builder()
        .setToken(fcmToken)
        .setNotification(Notification.builder()
            .setTitle("New Quiz Available")
            .setBody(quizTitle + " is now live!")
            .build())
        .putData("quizId", quizId.toString())
        .putData("screen", "/quiz")
        .build();

    try {
        String response = FirebaseMessaging.getInstance().send(message);
        System.out.println("Successfully sent message: " + response);
    } catch (FirebaseMessagingException e) {
        e.printStackTrace();
    }
}
```

## Topic-Based Notifications

Send to multiple users at once:

### Subscribe Users to Topics

```javascript
import notificationService from './lib/notificationService';

// Subscribe to topic
await notificationService.subscribeToTopic('quiz_updates');
await notificationService.subscribeToTopic('all_users');

// Unsubscribe from topic
await notificationService.unsubscribeFromTopic('quiz_updates');
```

### Send to Topic from Backend

```java
Message message = Message.builder()
    .setTopic("quiz_updates")  // Send to all users subscribed to this topic
    .setNotification(Notification.builder()
        .setTitle("New Quiz Available")
        .setBody("Check out today's challenge!")
        .build())
    .build();

FirebaseMessaging.getInstance().send(message);
```

## UI Components Using Notifications

All these screens now show real notification count:

- ✅ Home Screen
- ✅ Jobs Screen
- ✅ Profile Screen
- ✅ Leaderboards Screen

The notification bell shows:
- Red badge when there are unread notifications
- Number of unread notifications (or "99+" if > 99)
- Hidden badge when no unread notifications

## Notification Context API

Access notification data anywhere in the app:

```javascript
import { useNotifications } from '../contexts/NotificationContext';

const MyComponent = () => {
  const {
    notifications,        // Array of all notifications
    unreadCount,         // Number of unread notifications
    addNotification,     // Add a notification manually
    markAsRead,          // Mark notification as read
    markAllAsRead,       // Mark all as read
    clearNotification,   // Delete a notification
    clearAllNotifications // Delete all notifications
  } = useNotifications();

  return (
    <Text>You have {unreadCount} unread notifications</Text>
  );
};
```

## Notification Storage

Notifications are stored locally using AsyncStorage:
- Persist across app restarts
- Stored as JSON in secure storage
- Includes read/unread status
- Includes timestamp for sorting

## Troubleshooting

### No Notifications Received

1. Check if permissions are granted:
   ```javascript
   await notificationService.requestPermissions();
   ```

2. Verify FCM token is generated:
   ```javascript
   const token = await notificationService.getFCMToken();
   console.log('FCM Token:', token);
   ```

3. Check Firebase Console for delivery status

### Notifications Not Showing in Foreground

- This is handled automatically by the service
- Local notifications are triggered when FCM message arrives

### Badge Count Not Updating

- Badge count updates automatically from NotificationContext
- Check if useNotifications hook is imported correctly

### Token Refresh Issues

- Token refresh is handled automatically
- Old tokens are replaced in storage
- Make sure to send updated token to backend

## Best Practices

1. **Always send token to backend after login**
2. **Handle token refresh** - Update backend when token changes
3. **Use topics for broadcast messages**
4. **Include navigation data** - Help users reach relevant content
5. **Test on real devices** - Emulators may have limitations
6. **Handle permissions gracefully** - Don't force users to enable notifications

## Security Notes

- FCM tokens should be treated as sensitive data
- Always use HTTPS for backend communication
- Validate notification data before navigation
- Rate limit notification sending from backend

## Future Enhancements

Possible improvements:
- Scheduled local notifications
- Rich media notifications (images, actions)
- Notification categories/channels
- Analytics for notification engagement
- Silent notifications for data sync

## Support

For issues or questions:
1. Check Firebase Console for delivery logs
2. Review device logs for FCM errors
3. Test with Firebase Console test message feature
4. Verify google-services.json is up to date
