import 'package:flutter/material.dart';
import '../services/course_service.dart';
import '../services/api_service.dart';

class CourseAssignmentsScreen extends StatefulWidget {
  const CourseAssignmentsScreen({super.key});

  @override
  State<CourseAssignmentsScreen> createState() => _CourseAssignmentsScreenState();
}

class _CourseAssignmentsScreenState extends State<CourseAssignmentsScreen> {
  final CourseService _courseService = CourseService();
  final ApiService _api = ApiService();
  
  List<dynamic> _allCourses = [];
  bool _isLoading = true;

  final _batchController = TextEditingController();
  final _deptController = TextEditingController();
  String _semester = '1-1';
  final List<String> _selectedCourseIds = [];

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() => _isLoading = true);
    try {
      final courses = await _courseService.getAllCourses();
      setState(() => _allCourses = courses);
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

  Future<void> _submitAssignment() async {
    if (_batchController.text.isEmpty || _deptController.text.isEmpty || _selectedCourseIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields and select at least one course')),
      );
      return;
    }

    try {
      await _api.post('/courses/admin/assignments', body: {
        'batch': _batchController.text,
        'department': _deptController.text,
        'semester': _semester,
        'courseIds': _selectedCourseIds,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Course Assignment Successful!')),
        );
        setState(() {
          _batchController.clear();
          _deptController.clear();
          _selectedCourseIds.clear();
          _semester = '1-1';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to assign courses: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course Assignments'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Assign Courses to Batch', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _batchController,
                          decoration: const InputDecoration(labelText: 'Batch (e.g. 19)', border: OutlineInputBorder()),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: _deptController,
                          decoration: const InputDecoration(labelText: 'Dept (e.g. CSE)', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
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
                      DropdownMenuItem(value: '3-1', child: Text('Year 3 - Sem 1')),
                      DropdownMenuItem(value: '3-2', child: Text('Year 3 - Sem 2')),
                      DropdownMenuItem(value: '4-1', child: Text('Year 4 - Sem 1')),
                      DropdownMenuItem(value: '4-2', child: Text('Year 4 - Sem 2')),
                    ],
                    onChanged: (val) => setState(() => _semester = val!),
                  ),
                  const SizedBox(height: 24),
                  const Text('Select Courses', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ListView.builder(
                        itemCount: _allCourses.length,
                        itemBuilder: (context, index) {
                          final c = _allCourses[index];
                          final id = c['_id'];
                          final isSelected = _selectedCourseIds.contains(id);

                          return CheckboxListTile(
                            title: Text('${c['courseCode']} - ${c['courseName']}'),
                            subtitle: Text('${c['credit']} Credits • ${c['department']}'),
                            value: isSelected,
                            onChanged: (val) {
                              setState(() {
                                if (val == true) {
                                  _selectedCourseIds.add(id);
                                } else {
                                  _selectedCourseIds.remove(id);
                                }
                              });
                            },
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _submitAssignment,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Save Assignment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
    );
  }
}
