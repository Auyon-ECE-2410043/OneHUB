import 'package:flutter/material.dart';

class PlaceholderScreen extends StatelessWidget {
  final String title;

  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.engineering, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              '$title module',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Connected to backend.\nUI construction in progress.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            )
          ],
        ),
      ),
    );
  }
}
