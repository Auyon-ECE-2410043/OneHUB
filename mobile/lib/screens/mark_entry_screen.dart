import 'package:flutter/material.dart';
import '../services/mark_service.dart';
import '../services/course_service.dart';
import '../services/user_service.dart';

class MarkEntryScreen extends StatefulWidget {
  const MarkEntryScreen({super.key});

  @override
  State<MarkEntryScreen> createState() => _MarkEntryScreenState();
}

class _MarkEntryScreenState extends State<MarkEntryScreen> {
  final MarkService _markService = MarkService();
  final CourseService _courseService = CourseService();
  final UserService _userService = UserService();
  
  bool _isLoading = true;
  List<dynamic> _courses = [];
  
  String? _selectedCourseId;
  String _semester = '1-1';
  String _type = 'final';
  final _rollNoController = TextEditingController();
  final _gradeOrMarksController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
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

  Future<void> _submitMark() async {
    if (_selectedCourseId == null || _rollNoController.text.isEmpty || _gradeOrMarksController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields.')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      // Find student by roll no
      final students = await _userService.searchStudents(_rollNoController.text);
      if (students.isEmpty) {
        throw Exception('Student with Roll No ${_rollNoController.text} not found.');
      }
      final studentId = students[0]['_id'];

      final body = {
        'studentId': studentId,
        'courseId': _selectedCourseId,
        'semester': _semester,
        'type': _type,
      };

      if (_type == 'final') {
        body['grade'] = _gradeOrMarksController.text;
      } else {
        body['marksObtained'] = double.parse(_gradeOrMarksController.text);
        body['totalMarks'] = _type == 'ct' ? 20 : 10;
      }

      await _markService.submitMark(body);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mark submitted successfully!')));
        _rollNoController.clear();
        _gradeOrMarksController.clear();
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
      appBar: AppBar(
        title: const Text('Mark Entry'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Student & Course', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _rollNoController,
                      decoration: const InputDecoration(labelText: 'Student Roll No (e.g. 1903001)', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
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
                    const SizedBox(height: 24),
                    const Text('Evaluation Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _type,
                      decoration: const InputDecoration(labelText: 'Evaluation Type', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'final', child: Text('Final Grade (A+, A, B+, etc.)')),
                        DropdownMenuItem(value: 'ct', child: Text('Class Test (out of 20)')),
                        DropdownMenuItem(value: 'attendance', child: Text('Attendance (out of 10)')),
                      ],
                      onChanged: (val) => setState(() => _type = val!),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _gradeOrMarksController,
                      decoration: InputDecoration(
                        labelText: _type == 'final' ? 'Grade (e.g. A+)' : 'Marks Obtained', 
                        border: const OutlineInputBorder()
                      ),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _submitMark,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                        backgroundColor: Theme.of(context).primaryColor,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Submit Mark', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
