const fs = require('fs');
let code = fs.readFileSync('mobile/lib/screens/login_screen.dart', 'utf8');

// 1. Add state variable
code = code.replace(
  'bool _isVerifyStep = false;',
  'bool _isVerifyStep = false;\n  bool _isPasswordReset = false;'
);

// 2. Add handleForgotPassword method
const handleForgotPasswordStr = `
  Future<void> _handleForgotPassword() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      if (_emailController.text.trim().isEmpty) {
        throw Exception('Please enter your email address first to reset password');
      }
      await context.read<AuthProvider>().sendPasswordResetOtp(_emailController.text.trim());
      setState(() {
        _isVerifyStep = true;
        _isPasswordReset = true;
        _error = 'A password reset code has been sent to your email.';
      });
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
`;

code = code.replace(
  '  Future<void> _handleVerify() async {',
  handleForgotPasswordStr + '\n  Future<void> _handleVerify() async {'
);

// 3. Update handleVerify to check _isPasswordReset
const verifyOld = `await context.read<AuthProvider>().verifyFirstLogin(
        _userId,
        _otpController.text.trim(),
        _newPasswordController.text,
      );`;
const verifyNew = `if (_isPasswordReset) {
        await context.read<AuthProvider>().verifyPasswordReset(
          _emailController.text.trim(),
          _otpController.text.trim(),
          _newPasswordController.text,
        );
      } else {
        await context.read<AuthProvider>().verifyFirstLogin(
          _userId,
          _otpController.text.trim(),
          _newPasswordController.text,
        );
      }`;
code = code.replace(verifyOld, verifyNew);

// 4. Update UI Text
code = code.replace(
  'Text(\n                _isVerifyStep ? \'Security Check\' : \'RUET OneHUB\',',
  'Text(\n                _isVerifyStep ? (_isPasswordReset ? \'Password Reset\' : \'Security Check\') : \'RUET OneHUB\','
);

// 5. Add Forgot Password button
const forgotBtn = `
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: _isLoading ? null : _handleForgotPassword,
                    child: const Text('Forgot Password?'),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
`;
code = code.replace(
  'const SizedBox(height: 24),\n                ElevatedButton(',
  forgotBtn
);

// 6. Add Back button to Verify step
const backBtn = `
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _isVerifyStep = false;
                      _isPasswordReset = false;
                      _error = '';
                    });
                  },
                  child: const Text('Back to Login'),
                ),
`;
code = code.replace(
  '                    : const Text(\'Verify & Change Password\', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),\n                ),',
  '                    : const Text(\'Verify & Change Password\', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),\n                ),' + backBtn
);

fs.writeFileSync('mobile/lib/screens/login_screen.dart', code);
console.log('Patched login_screen.dart');
