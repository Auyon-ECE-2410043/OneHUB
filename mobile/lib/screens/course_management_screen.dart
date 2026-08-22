// ==========================================
// File: course_management_screen.dart
// Description: Flutter screen widget for the course_management view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/course_service.dart';

class CourseManagementScreen extends StatefulWidget {
  const CourseManagementScreen({super.key});

  @override
  State<CourseManagementScreen> createState() => _CourseManagementScreenState();
}

class _CourseManagementScreenState extends State<CourseManagementScreen> {
  final CourseService _courseService = CourseService();
  List<dynamic> _courses = [];
  bool _isLoading = true;

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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load courses: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAddCourseModal() {
    final codeController = TextEditingController();
    final nameController = TextEditingController();
    final creditController = TextEditingController();
    final deptController = TextEditingController();
    String semester = '1-1';
    String type = 'theory';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Create New Course',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: codeController,
                  decoration: const InputDecoration(labelText: 'Course Code (e.g. CSE 1101)'),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Course Name'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: creditController,
                        decoration: const InputDecoration(labelText: 'Credits'),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: deptController,
                        decoration: const InputDecoration(labelText: 'Department (e.g. CSE)'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: semester,
                  decoration: const InputDecoration(labelText: 'Semester'),
                  items: const [
                    DropdownMenuItem(value: '1-1', child: Text('Year 1 - Sem 1')),
                    DropdownMenuItem(value: '1-2', child: Text('Year 1 - Sem 2')),
                    DropdownMenuItem(value: '2-1', child: Text('Year 2 - Sem 1')),
                    DropdownMenuItem(value: '2-2', child: Text('Year 2 - Sem 2')),
                    DropdownMenuItem(value: '3-1', child: Text('Year 3 - Sem 1')),
                    DropdownMenuItem(value: '3-2', child: Text('Year 3 - Sem 2')),
                    DropdownMenuItem(value: '4-1', child: Text('Year 4 - Sem 1')),
                    DropdownMenuItem(value: '4-2', child: Text('Year 4 - Sem 2')),
                  ],
                  onChanged: (val) => setModalState(() => semester = val!),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: type,
                  decoration: const InputDecoration(labelText: 'Course Type'),
                  items: const [
                    DropdownMenuItem(value: 'theory', child: Text('Theory')),
                    DropdownMenuItem(value: 'sessional', child: Text('Sessional')),
                  ],
                  onChanged: (val) => setModalState(() => type = val!),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (codeController.text.isEmpty || nameController.text.isEmpty) return;
                    try {
                      await _courseService.createCourse({
                        'courseCode': codeController.text,
                        'courseName': nameController.text,
                        'credit': double.tryParse(creditController.text) ?? 3.0,
                        'department': deptController.text,
                        'semester': semester,
                        'courseType': type,
                      });
                      if (context.mounted) Navigator.pop(context);
                      _fetchCourses();
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Failed to add: $e')),
                        );
                      }
                    }
                  },
                  child: const Text('Add Course'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course Management'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddCourseModal,
        backgroundColor: Theme.of(context).primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchCourses,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _courses.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final course = _courses[index];
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
                                course['courseCode'],
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).primaryColor,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: course['courseType'] == 'theory' ? Colors.blue.shade50 : Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  course['courseType'].toString().toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: course['courseType'] == 'theory' ? Colors.blue.shade700 : Colors.green.shade700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            course['courseName'],
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Credits: ${course['credit']} • Dept: ${course['department']} • Sem: ${course['semester']}',
                            style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                          ),
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
