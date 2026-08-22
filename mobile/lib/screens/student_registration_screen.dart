import 'package:flutter/material.dart';
import '../services/course_service.dart';

class StudentRegistrationScreen extends StatefulWidget {
  const StudentRegistrationScreen({super.key});

  @override
  State<StudentRegistrationScreen> createState() => _StudentRegistrationScreenState();
}

class _StudentRegistrationScreenState extends State<StudentRegistrationScreen> {
  final CourseService _courseService = CourseService();
  
  bool _isLoading = true;
  Map<String, dynamic>? _activeRegistration;
  
  Map<String, dynamic>? _assignedData;
  List<dynamic> _assignedCourses = [];
  String _semester = '';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final activeReg = await _courseService.getActiveRegistration();
      if (activeReg != null) {
        setState(() {
          _activeRegistration = activeReg;
        });
      } else {
        // No active registration, fetch courses to register
        final assigned = await _courseService.getAssignedCourses();
        setState(() {
          _assignedData = assigned;
          _assignedCourses = assigned['courses'] ?? [];
          _semester = assigned['semester'] ?? '1-1';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitRegistration() async {
    try {
      await _courseService.submitRegistration(_semester, []);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registration submitted!')),
        );
      }
      _fetchData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
      }
    }
  }

  Widget _buildStatusCard() {
    final status = _activeRegistration!['status'];
    final courses = _activeRegistration!['courseIds'] as List<dynamic>;

    Color statusColor = Colors.orange;
    String statusText = 'Pending Approval';
    if (status == 'approved') {
      statusColor = Colors.green;
      statusText = 'Approved';
    } else if (status == 'rejected') {
      statusColor = Colors.red;
      statusText = 'Rejected';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          color: statusColor.withValues(alpha: 0.1),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: statusColor.withValues(alpha: 0.5)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Icon(
                  status == 'approved' ? Icons.check_circle : (status == 'rejected' ? Icons.cancel : Icons.hourglass_top),
                  color: statusColor,
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Registration Status', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(statusText, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Registered Courses',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: ListView.separated(
            itemCount: courses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final c = courses[index];
              return Card(
                child: ListTile(
                  title: Text(c['courseCode'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(c['courseName']),
                  trailing: Text('${c['credit']} Cr'),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRegistrationForm() {
    if (_assignedCourses.isEmpty) {
      return const Center(child: Text('No courses assigned for this semester yet.'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          color: Colors.blue.shade50,
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Semester: $_semester',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
                const SizedBox(height: 4),
                Text(
                  'Total Credits: ${_assignedData?['totalCredit'] ?? 0}',
                  style: TextStyle(color: Colors.blue.shade700),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Assigned Courses',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: ListView.separated(
            itemCount: _assignedCourses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final c = _assignedCourses[index];
              return Card(
                child: ListTile(
                  title: Text(c['courseCode'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(c['courseName']),
                  trailing: Text('${c['credit']} Cr'),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _submitRegistration,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            backgroundColor: Theme.of(context).primaryColor,
            foregroundColor: Colors.white,
          ),
          child: const Text('Submit Registration Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course Registration'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: _activeRegistration != null 
                ? _buildStatusCard() 
                : _buildRegistrationForm(),
            ),
    );
  }
}
