import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class MyProfileScreen extends StatelessWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    if (user == null) return const Scaffold(body: Center(child: Text('Not logged in')));

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 24),
            CircleAvatar(
              radius: 50,
              backgroundColor: Theme.of(context).primaryColor,
              child: Text(
                user['name'][0].toUpperCase(),
                style: const TextStyle(fontSize: 40, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            Text(user['name'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(user['role'].toString().toUpperCase(), style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
            const SizedBox(height: 32),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildInfoRow(Icons.email, 'Email', user['email']),
                    const Divider(),
                    if (user['rollNo'] != null) ...[
                      _buildInfoRow(Icons.numbers, 'Roll No', user['rollNo']),
                      const Divider(),
                    ],
                    if (user['department'] != null) ...[
                      _buildInfoRow(Icons.business, 'Department', user['department']),
                      const Divider(),
                    ],
                    if (user['batch'] != null) ...[
                      _buildInfoRow(Icons.school, 'Batch', user['batch'].toString()),
                      const Divider(),
                    ],
                    _buildInfoRow(Icons.phone, 'Phone', user['phone'] ?? 'Not set'),
                    const Divider(),
                    _buildInfoRow(Icons.water_drop, 'Blood Group', user['bloodGroup'] ?? 'Not set'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey.shade600),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
              Text(value, style: const TextStyle(fontSize: 16)),
            ],
          ),
        ],
      ),
    );
  }
}
