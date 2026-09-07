// ==========================================
// File: auth_provider.dart
// Description: Flutter utility or widget class for auth_provider.dart.
// ==========================================

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  Map<String, dynamic>? _user;
  String? _token;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    
    if (_token != null) {
      try {
        final data = await _api.get('/auth/me');
        _user = data['user'];
      } catch (e) {
        _token = null;
        _user = null;
        await prefs.remove('token');
      }
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _api.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    
    if (data['requiresOtp'] == true) {
      return data; // Return the response early so UI can show verify screen
    }

    _token = data['token'];
    _user = data['user'];
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    
    notifyListeners();
    return data;
  }

  Future<void> verifyFirstLogin(String userId, String otp, String newPassword) async {
    final data = await _api.post('/auth/verify-first-login', body: {
      'userId': userId,
      'otp': otp,
      'newPassword': newPassword,
    });
    
    _token = data['token'];
    _user = data['user'];
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }

  Future<void> sendPasswordResetOtp(String email) async {
    await _api.post('/auth/send-otp', body: {
      'email': email,
    });
  }

  Future<void> verifyPasswordReset(String email, String otp, String newPassword) async {
    final data = await _api.post('/auth/verify-otp', body: {
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
    });
    
    _token = data['token'];
    _user = data['user'];
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    
    notifyListeners();
  }
}
