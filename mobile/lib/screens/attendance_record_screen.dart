import 'package:flutter/material.dart';
import '../services/course_service.dart';
import '../services/api_service.dart';

class AttendanceRecordScreen extends StatefulWidget {
  const AttendanceRecordScreen({super.key});

  @override
  State<AttendanceRecordScreen> createState() => _AttendanceRecordScreenState();
}

class _AttendanceRecordScreenState extends State<AttendanceRecordScreen> {
  final CourseService _courseService = CourseService();
  final ApiService _api = ApiService();
  
  bool _isLoading = true;
  List<dynamic> _courses = [];

  @override
  void initState() {
    super.initState();
    _fetchAttendance();
  }

  Future<void> _fetchAttendance() async {
    setState(() => _isLoading = true);
    try {
      final courseData = await _courseService.getAssignedCourses();
      final courses = courseData['courses'] ?? [];
      
      // We will attach an attendance string to each course
      for (var c in courses) {
        try {
          final att = await _api.get('/attendance/${c['_id']}');
          final total = att['totalClasses'] ?? 0;
          final present = att['presentCount'] ?? 0;
          final percentage = att['percentage'] ?? 0;
          c['attendanceStr'] = '$present / $total ($percentage%)';
        } catch (e) {
          c['attendanceStr'] = '0 / 0 (0%)';
        }
      }
      
      setState(() => _courses = courses);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Record')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _courses.length,
              itemBuilder: (context, index) {
                final c = _courses[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.co_present, color: Colors.teal),
                    title: Text(c['courseCode'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(c['courseName']),
                    trailing: Text(
                      c['attendanceStr'] ?? 'N/A',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
