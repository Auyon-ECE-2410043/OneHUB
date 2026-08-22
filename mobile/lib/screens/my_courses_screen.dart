// ==========================================
// File: my_courses_screen.dart
// Description: Flutter screen widget for the my_courses view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/course_service.dart';

class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  final CourseService _courseService = CourseService();
  bool _isLoading = true;
  List<dynamic> _courses = [];
  String _semester = '';

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _isLoading = true);
    try {
      final data = await _courseService.getAssignedCourses();
      setState(() {
        _courses = data['courses'] ?? [];
        _semester = data['semester'] ?? '1-1';
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Courses')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Semester: $_semester', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        final c = _courses[index];
                        return Card(
                          child: ListTile(
                            title: Text(c['courseCode'], style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(c['courseName']),
                            trailing: Text('${c['credit']} Cr'),
                          ),
                        );
                      },
                    ),
                  )
                ],
              ),
            ),
    );
  }
}
