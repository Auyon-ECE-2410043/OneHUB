import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Handling a background message: ${message.messageId}');
}

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final ApiService _api = ApiService();

  static Future<void> initialize() async {
    // Request permission for iOS/Web
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted push notification permission');
      
      // Register background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        debugPrint('Message data: ${message.data}');

        if (message.notification != null) {
          debugPrint('Message also contained a notification: ${message.notification}');
          // You could show a local notification here if desired
        }
      });
      
      // Send token to backend
      await sendTokenToBackend();
      
      // Listen for token refreshes
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        _sendToken(newToken);
      });
    }
  }

  static Future<void> sendTokenToBackend() async {
    try {
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        await _sendToken(token);
      }
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
    }
  }

  static Future<void> _sendToken(String token) async {
    try {
      await _api.post('/auth/update-fcm-token', body: {'token': token});
      debugPrint('Successfully registered FCM token with backend.');
    } catch (e) {
      debugPrint('Failed to send FCM token to backend: $e');
    }
  }
}
