// ==========================================
// File: faculty_attendance_screen.dart
// Description: Flutter screen widget for the faculty_attendance view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/course_service.dart';
import '../services/user_service.dart';

class FacultyAttendanceScreen extends StatefulWidget {
  const FacultyAttendanceScreen({super.key});

  @override
  State<FacultyAttendanceScreen> createState() => _FacultyAttendanceScreenState();
}

class _FacultyAttendanceScreenState extends State<FacultyAttendanceScreen> {
  final ApiService _api = ApiService();
  final CourseService _courseService = CourseService();
  final UserService _userService = UserService();

  bool _isLoading = true;
  List<dynamic> _courses = [];
  
  String? _selectedCourseId;
  String _semester = '1-1';
  final DateTime _date = DateTime.now();
  bool _isPresent = true;
  final _rollNoController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _isLoading = true);
    try {
      final courses = await _courseService.getAllCourses();
      setState(() => _courses = courses);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitAttendance() async {
    if (_selectedCourseId == null || _rollNoController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select course and enter Roll No.')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      final students = await _userService.searchStudents(_rollNoController.text);
      if (students.isEmpty) throw Exception('Student not found.');
      final studentId = students[0]['_id'];

      await _api.post('/attendance', body: {
        'studentId': studentId,
        'courseId': _selectedCourseId,
        'semester': _semester,
        'date': _date.toIso8601String(),
        'present': _isPresent,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance marked successfully!')));
        _rollNoController.clear();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mark Attendance')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(labelText: 'Course', border: OutlineInputBorder()),
                      items: _courses.map((c) => DropdownMenuItem<String>(
                        value: c['_id'],
                        child: Text('${c['courseCode']} - ${c['courseName']}'),
                      )).toList(),
                      onChanged: (val) => setState(() => _selectedCourseId = val),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _semester,
                      decoration: const InputDecoration(labelText: 'Semester', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: '1-1', child: Text('Year 1 - Sem 1')),
                        DropdownMenuItem(value: '1-2', child: Text('Year 1 - Sem 2')),
                        DropdownMenuItem(value: '2-1', child: Text('Year 2 - Sem 1')),
                        DropdownMenuItem(value: '2-2', child: Text('Year 2 - Sem 2')),
                      ],
                      onChanged: (val) => setState(() => _semester = val!),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _rollNoController,
                      decoration: const InputDecoration(labelText: 'Student Roll No', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('Present'),
                      value: _isPresent,
                      onChanged: (val) => setState(() => _isPresent = val),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _submitAttendance,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                        backgroundColor: Theme.of(context).primaryColor,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Submit Attendance', style: TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
