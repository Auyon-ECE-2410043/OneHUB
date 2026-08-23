// ==========================================
// File: login_screen.dart
// Description: Flutter screen widget for the login view.
// ==========================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  
  bool _isLoading = false;
  String _error = '';
  
  bool _isVerifyStep = false;
  String _userId = '';

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final res = await context.read<AuthProvider>().login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      
      if (res['requiresOtp'] == true) {
        setState(() {
          _isVerifyStep = true;
          _userId = res['userId'];
          _error = res['message'] ?? 'Check your email for the OTP.';
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleVerify() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      if (_newPasswordController.text.length < 6) {
        throw Exception('New password must be at least 6 characters');
      }
      
      await context.read<AuthProvider>().verifyFirstLogin(
        _userId,
        _otpController.text.trim(),
        _newPasswordController.text,
      );
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                _isVerifyStep ? Icons.security : Icons.school,
                size: 80,
                color: Theme.of(context).primaryColor,
              ),
              const SizedBox(height: 16),
              Text(
                _isVerifyStep ? 'Security Check' : 'RUET OneHUB',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _isVerifyStep ? 'Set up your new password' : 'Student Portal Login',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 48),
              if (_error.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: _isVerifyStep && !_error.toLowerCase().contains('failed') && !_error.toLowerCase().contains('must') ? Colors.blue.shade50 : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _isVerifyStep && !_error.toLowerCase().contains('failed') && !_error.toLowerCase().contains('must') ? Colors.blue.shade200 : Colors.red.shade200),
                  ),
                  child: Text(
                    _error,
                    style: TextStyle(color: _isVerifyStep && !_error.toLowerCase().contains('failed') && !_error.toLowerCase().contains('must') ? Colors.blue.shade700 : Colors.red.shade700, fontSize: 14),
                  ),
                ),
                
              if (!_isVerifyStep) ...[
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password (leave blank if first login)',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading 
                      ? const SizedBox(
                          height: 20, 
                          width: 20, 
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                        )
                      : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ] else ...[
                TextField(
                  controller: _otpController,
                  decoration: const InputDecoration(
                    labelText: 'Verification Code (OTP)',
                    prefixIcon: Icon(Icons.password),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _newPasswordController,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleVerify,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                  ),
                  child: _isLoading 
                      ? const SizedBox(
                          height: 20, 
                          width: 20, 
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                        )
                      : const Text('Verify & Change Password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ],
            ].animate(interval: 50.ms).fade(duration: 500.ms).slideY(begin: 0.05, end: 0),
          ),
        ),
      ),
    );
  }
}
