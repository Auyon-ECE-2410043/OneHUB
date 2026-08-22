// ==========================================
// File: student_hall_screen.dart
// Description: Flutter screen widget for the student_hall view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/student_service.dart';

class StudentHallScreen extends StatefulWidget {
  const StudentHallScreen({super.key});

  @override
  State<StudentHallScreen> createState() => _StudentHallScreenState();
}

class _StudentHallScreenState extends State<StudentHallScreen> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  Map<String, dynamic>? _application;

  @override
  void initState() {
    super.initState();
    _fetchApplication();
  }

  Future<void> _fetchApplication() async {
    setState(() => _isLoading = true);
    try {
      final app = await _studentService.getMyHallApplication();
      if (mounted) setState(() => _application = app.isEmpty ? null : app);
    } catch (e) {
      // no application yet
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitApplication() async {
    setState(() => _isLoading = true);
    try {
      await _studentService.applyHall({
        'cgpa': 3.5, // Mock data for quick apply
        'reason': 'Mobile App Submission',
      });
      await _fetchApplication();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application Submitted!')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hall Application')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: _application == null
                  ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Icon(Icons.apartment, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('You have not applied for a hall seat yet.', textAlign: TextAlign.center),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _submitApplication,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.all(16),
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Submit Application'),
                        ),
                      ],
                    )
                  : Card(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Application Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            ListTile(
                              leading: Icon(
                                _application!['status'] == 'approved' ? Icons.check_circle : 
                                _application!['status'] == 'rejected' ? Icons.cancel : Icons.pending,
                                color: _application!['status'] == 'approved' ? Colors.green : 
                                       _application!['status'] == 'rejected' ? Colors.red : Colors.orange,
                              ),
                              title: Text((_application!['status'] ?? 'pending').toUpperCase()),
                              subtitle: Text('CGPA Submitted: ${_application!['cgpa']}'),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
    );
  }
}
