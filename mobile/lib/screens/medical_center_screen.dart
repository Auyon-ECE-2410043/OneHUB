// ==========================================
// File: medical_center_screen.dart
// Description: Flutter screen widget for the medical_center view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/student_service.dart';

class MedicalCenterScreen extends StatefulWidget {
  const MedicalCenterScreen({super.key});

  @override
  State<MedicalCenterScreen> createState() => _MedicalCenterScreenState();
}

class _MedicalCenterScreenState extends State<MedicalCenterScreen> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  List<dynamic> _appointments = [];

  @override
  void initState() {
    super.initState();
    _fetchAppointments();
  }

  Future<void> _fetchAppointments() async {
    setState(() => _isLoading = true);
    try {
      final data = await _studentService.getMedicalAppointments();
      setState(() => _appointments = data);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Medical Center')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('My Appointments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  if (_appointments.isEmpty)
                    const Text('No medical appointments found.')
                  else
                    Expanded(
                      child: ListView.builder(
                        itemCount: _appointments.length,
                        itemBuilder: (context, index) {
                          final appt = _appointments[index];
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.medical_services, color: Colors.red),
                              title: Text(appt['reason'] ?? 'Appointment'),
                              subtitle: Text(appt['date'] != null ? appt['date'].toString().split('T')[0] : ''),
                              trailing: Text(
                                (appt['status'] ?? 'pending').toUpperCase(),
                                style: TextStyle(
                                  color: appt['status'] == 'completed' ? Colors.green : Colors.orange,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}
