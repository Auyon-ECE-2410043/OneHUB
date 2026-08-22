import 'package:flutter/material.dart';
import '../services/student_service.dart';

class ClearanceStatusScreen extends StatefulWidget {
  const ClearanceStatusScreen({super.key});

  @override
  State<ClearanceStatusScreen> createState() => _ClearanceStatusScreenState();
}

class _ClearanceStatusScreenState extends State<ClearanceStatusScreen> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  Map<String, dynamic> _clearance = {};
  final String _semester = '1-1';

  @override
  void initState() {
    super.initState();
    _fetchClearance();
  }

  Future<void> _fetchClearance() async {
    setState(() => _isLoading = true);
    try {
      final data = await _studentService.getClearanceStatus(_semester);
      setState(() => _clearance = data);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Widget _buildStatusRow(String title, String? status) {
    Color color = Colors.orange;
    IconData icon = Icons.pending;
    
    if (status == 'cleared') {
      color = Colors.green;
      icon = Icons.check_circle;
    } else if (status == 'not_applicable') {
      color = Colors.grey;
      icon = Icons.remove_circle;
    } else if (status == 'due') {
      color = Colors.red;
      icon = Icons.error;
    }

    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title),
      trailing: Text(
        (status ?? 'pending').toUpperCase().replaceAll('_', ' '),
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final depts = _clearance['departments'] ?? {};

    return Scaffold(
      appBar: AppBar(title: const Text('Clearance Status')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Semester: $_semester', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Card(
              child: Column(
                children: [
                  _buildStatusRow('Library', depts['library']?['status']),
                  const Divider(height: 1),
                  _buildStatusRow('Hall', depts['hall']?['status']),
                  const Divider(height: 1),
                  _buildStatusRow('Department', depts['department']?['status']),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
