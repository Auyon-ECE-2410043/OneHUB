import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConfig {
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    } else if (Platform.isAndroid) {
      // 10.0.2.2 is the special alias to your host loopback interface (localhost) for Android emulators
      // Change this to your computer's IP (e.g. 192.168.1.5) if testing on a physical device over Wi-Fi
      return 'http://10.0.2.2:5000/api';
    } else if (Platform.isIOS) {
      // iOS simulator uses localhost
      return 'http://localhost:5000/api';
    } else {
      return 'http://localhost:5000/api';
    }
  }
}
