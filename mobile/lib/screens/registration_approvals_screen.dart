import 'package:flutter/material.dart';
import '../services/course_service.dart';

class RegistrationApprovalsScreen extends StatefulWidget {
  const RegistrationApprovalsScreen({super.key});

  @override
  State<RegistrationApprovalsScreen> createState() => _RegistrationApprovalsScreenState();
}

class _RegistrationApprovalsScreenState extends State<RegistrationApprovalsScreen> {
  final CourseService _courseService = CourseService();
  List<dynamic> _registrations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRegistrations();
  }

  Future<void> _fetchRegistrations() async {
    setState(() => _isLoading = true);
    try {
      final regs = await _courseService.getPendingRegistrations();
      setState(() => _registrations = regs);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load pending registrations: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await _courseService.updateRegistrationStatus(id, status);
      _fetchRegistrations();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration ${status == "approved" ? "Approved" : "Rejected"}')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update status: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Registrations'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _registrations.isEmpty
              ? const Center(child: Text('No pending registrations.'))
              : RefreshIndicator(
                  onRefresh: _fetchRegistrations,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _registrations.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final reg = _registrations[index];
                      final student = reg['studentId'];
                      final courses = reg['courseIds'] as List<dynamic>;

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    student['name'],
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'PENDING',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.orange.shade700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Roll: ${student['rollNo']} • Dept: ${student['department']} • Batch: ${student['batch']}',
                                style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                              ),
                              const SizedBox(height: 8),
                              const Divider(),
                              const SizedBox(height: 8),
                              const Text('Requested Courses:', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              ...courses.map((c) => Padding(
                                    padding: const EdgeInsets.only(bottom: 4.0),
                                    child: Text('• ${c['courseCode']} - ${c['courseName']}'),
                                  )),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton(
                                    onPressed: () => _updateStatus(reg['_id'], 'rejected'),
                                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                                    child: const Text('Reject'),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () => _updateStatus(reg['_id'], 'approved'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green,
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text('Approve'),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
