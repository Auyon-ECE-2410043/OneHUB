import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ManageRoutineScreen extends StatefulWidget {
  const ManageRoutineScreen({super.key});

  @override
  State<ManageRoutineScreen> createState() => _ManageRoutineScreenState();
}

class _ManageRoutineScreenState extends State<ManageRoutineScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _slots = [];
  List<dynamic> _facultyList = [];
  List<String> _departments = [];
  
  String _selectedDept = 'All';
  String _selectedTeacher = 'All';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final routineRes = await _apiService.get('/routine');
      final facultyRes = await _apiService.get('/faculty?limit=1000');
      
      if (mounted) {
        setState(() {
          _slots = routineRes['routine'] ?? [];
          _facultyList = facultyRes['faculty'] ?? [];
          
          final depts = _facultyList.map((f) => f['department']?.toString() ?? '').where((d) => d.isNotEmpty).toSet().toList();
          depts.sort();
          _departments = ['All', ...depts];
          
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSlotModal([Map<String, dynamic>? slot]) {
    final isEditing = slot != null;
    final courseController = TextEditingController(text: slot?['courseCode'] ?? '');
    final typeController = TextEditingController(text: slot?['type'] ?? 'theory');
    final semController = TextEditingController(text: slot?['semester'] ?? '1-1');
    final seriesController = TextEditingController(text: slot?['series'] ?? '2025 Series');
    final roomController = TextEditingController(text: slot?['roomOrLab'] ?? '');
    
    // Auto fill teacher initials from filter if not editing and a specific teacher is selected
    String initialTeacher = '';
    if (isEditing) {
      initialTeacher = (slot?['teacherInitials'] as List?)?.join(', ') ?? '';
    } else if (_selectedTeacher != 'All') {
      initialTeacher = _selectedTeacher;
    }
    final teacherController = TextEditingController(text: initialTeacher);
    
    String day = slot?['dayOfWeek'] ?? 'Sunday';
    String startTime = slot?['startTime'] ?? '08:00';
    String endTime = slot?['endTime'] ?? '08:50';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return AlertDialog(
            title: Text(isEditing ? 'Edit Slot' : 'Add Slot'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(controller: courseController, decoration: const InputDecoration(labelText: 'Course Code')),
                  DropdownButtonFormField<String>(
                    value: typeController.text,
                    items: const [
                      DropdownMenuItem(value: 'theory', child: Text('Theory')),
                      DropdownMenuItem(value: 'sessional', child: Text('Sessional')),
                    ],
                    onChanged: (v) => setModalState(() => typeController.text = v!),
                    decoration: const InputDecoration(labelText: 'Type'),
                  ),
                  TextField(controller: seriesController, decoration: const InputDecoration(labelText: 'Series (e.g. 2024 Series)')),
                  TextField(controller: semController, decoration: const InputDecoration(labelText: 'Semester (e.g. 1-1)')),
                  DropdownButtonFormField<String>(
                    value: day,
                    items: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                        .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                        .toList(),
                    onChanged: (v) => setModalState(() => day = v!),
                    decoration: const InputDecoration(labelText: 'Day'),
                  ),
                  Row(
                    children: [
                      Expanded(child: TextField(controller: TextEditingController(text: startTime), onChanged: (v) => startTime = v, decoration: const InputDecoration(labelText: 'Start Time'))),
                      const SizedBox(width: 8),
                      Expanded(child: TextField(controller: TextEditingController(text: endTime), onChanged: (v) => endTime = v, decoration: const InputDecoration(labelText: 'End Time'))),
                    ],
                  ),
                  TextField(controller: roomController, decoration: const InputDecoration(labelText: 'Room/Lab')),
                  TextField(controller: teacherController, decoration: const InputDecoration(labelText: 'Teacher Initials (comma separated)')),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () async {
                  final data = {
                    'courseCode': courseController.text,
                    'type': typeController.text,
                    'semester': semController.text,
                    'series': seriesController.text,
                    'dayOfWeek': day,
                    'startTime': startTime,
                    'endTime': endTime,
                    'roomOrLab': roomController.text,
                    'teacherInitials': teacherController.text,
                    'department': 'ECE', // Defaulting for mobile prototype
                  };
                  try {
                    if (isEditing) {
                      await _apiService.put('/routine/${slot['_id']}', body: data);
                    } else {
                      await _apiService.post('/routine', body: data);
                    }
                    Navigator.pop(context);
                    _fetchData();
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                  }
                },
                child: const Text('Save'),
              ),
            ],
          );
        }
      ),
    );
  }

  Future<void> _deleteSlot(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Slot'),
        content: const Text('Are you sure you want to delete this routine slot?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      await _apiService.delete('/routine/$id');
      _fetchData();
    }
  }

  @override
  Widget build(BuildContext context) {
    List<dynamic> filteredSlots = _slots;
    if (_selectedTeacher != 'All') {
      filteredSlots = _slots.where((s) {
        final initials = s['teacherInitials'] as List?;
        return initials != null && initials.contains(_selectedTeacher);
      }).toList();
    }

    List<dynamic> availableTeachers = _facultyList;
    if (_selectedDept != 'All') {
      availableTeachers = _facultyList.where((f) => f['department'] == _selectedDept).toList();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Routine'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () => _showSlotModal()),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  color: Colors.white,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.business, color: Colors.grey, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _selectedDept,
                              items: _departments.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                              onChanged: (val) {
                                setState(() {
                                  _selectedDept = val!;
                                  _selectedTeacher = 'All';
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.person, color: Colors.grey, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _selectedTeacher,
                              items: [
                                const DropdownMenuItem(value: 'All', child: Text('All Teachers')),
                                ...availableTeachers.map((f) {
                                  final acr = f['teacherAcronym'];
                                  final val = (acr != null && acr.toString().isNotEmpty) ? acr : f['name'];
                                  return DropdownMenuItem(
                                    value: val,
                                    child: Text('${f['name']} (${acr ?? "N/A"})'),
                                  );
                                }),
                              ],
                              onChanged: (val) {
                                setState(() => _selectedTeacher = val!);
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: filteredSlots.isEmpty
                      ? const Center(child: Text('No classes found for this selection.'))
                      : ListView.builder(
                          itemCount: filteredSlots.length,
                          itemBuilder: (context, index) {
                            final slot = filteredSlots[index];
                            final initials = (slot['teacherInitials'] as List?)?.join(', ') ?? '';
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              child: ListTile(
                                title: Text('${slot['courseCode']} (${slot['type']})', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${slot['dayOfWeek']} ${slot['startTime']}-${slot['endTime']}\nRoom: ${slot['roomOrLab']} | Teachers: $initials'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => _showSlotModal(slot)),
                                    IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _deleteSlot(slot['_id'])),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
