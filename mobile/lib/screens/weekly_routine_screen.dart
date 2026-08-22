import 'package:flutter/material.dart';
import '../services/student_service.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class WeeklyRoutineScreen extends StatefulWidget {
  const WeeklyRoutineScreen({super.key});

  @override
  State<WeeklyRoutineScreen> createState() => _WeeklyRoutineScreenState();
}

class _WeeklyRoutineScreenState extends State<WeeklyRoutineScreen> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  List<dynamic> _routine = [];

  @override
  void initState() {
    super.initState();
    _fetchRoutine();
  }

  Future<void> _fetchRoutine() async {
    setState(() => _isLoading = true);
    try {
      final data = await _studentService.getMyWeeklyRoutine();
      setState(() => _routine = data['routine'] ?? []);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Routine')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _routine.isEmpty
              ? const Center(child: Text('No classes scheduled.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _routine.length,
                  itemBuilder: (context, index) {
                    final item = _routine[index];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.schedule, color: Colors.blue),
                        title: Text('${item['courseId']['courseCode'] ?? 'Course'} - ${item['type']}'),
                        subtitle: Text('${item['dayOfWeek']} • ${item['startTime']} - ${item['endTime']}'),
                        trailing: Text('Room ${item['room']}'),
                      ),
                    );
                  },
                ),
    );
  }
}
