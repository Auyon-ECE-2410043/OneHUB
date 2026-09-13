// ==========================================
// File: my_results_screen.dart
// Description: Flutter screen widget for the my_results view.
// ==========================================

import 'package:flutter/material.dart';
import '../services/mark_service.dart';

class MyResultsScreen extends StatefulWidget {
  const MyResultsScreen({super.key});

  @override
  State<MyResultsScreen> createState() => _MyResultsScreenState();
}

class _MyResultsScreenState extends State<MyResultsScreen> {
  final MarkService _markService = MarkService();
  bool _isLoading = true;
  double _cgpa = 0.0;
  List<dynamic> _semesters = [];

  @override
  void initState() {
    super.initState();
    _fetchResults();
  }

  Future<void> _fetchResults() async {
    setState(() => _isLoading = true);
    try {
      final data = await _markService.getAcademicSummary();
      setState(() {
        _cgpa = (data['cgpa'] ?? 0.0).toDouble();
        _semesters = data['semesters'] ?? [];
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load results: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Results')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_semesters.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text("No academic results found.", style: TextStyle(fontSize: 16, color: Colors.grey)),
                      )
                    )
                  else ...[
                    Card(
                      color: Theme.of(context).primaryColor,
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            const Text("Cumulative GPA (CGPA)", style: TextStyle(color: Colors.white70, fontSize: 16)),
                            const SizedBox(height: 8),
                            Text(
                              _cgpa.toStringAsFixed(2),
                              style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text("Semester Breakdown", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _semesters.length,
                        itemBuilder: (context, index) {
                          final sem = _semesters[index];
                          final courses = sem['courses'] as List<dynamic>;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: ExpansionTile(
                              title: Text('Semester ${sem['semester']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('GPA: ${sem['gpa'].toStringAsFixed(2)}'),
                              children: courses.map((c) {
                                return ListTile(
                                  title: Text(c['courseCode']),
                                  subtitle: Text(c['courseName']),
                                  trailing: Text(
                                    c['grade'] ?? 'N/A',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: c['grade'] == 'F' ? Colors.red : Colors.green,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}
