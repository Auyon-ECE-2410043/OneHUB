import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'services/local_notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env").catchError((_) {}); // Load .env, ignore if missing
  
  await LocalNotificationService.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const OneHubApp(),
    ),
  );
}

class OneHubApp extends StatelessWidget {
  const OneHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RUET OneHUB',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }
          
          if (auth.isAuthenticated) {
            return const HomeScreen();
          }
          
          return const LoginScreen();
        },
      ),
    );
  }
}
