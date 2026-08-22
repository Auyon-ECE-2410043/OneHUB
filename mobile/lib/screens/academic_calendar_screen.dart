import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/calendar_service.dart';

class AcademicCalendarScreen extends StatefulWidget {
  const AcademicCalendarScreen({super.key});

  @override
  State<AcademicCalendarScreen> createState() => _AcademicCalendarScreenState();
}

class _AcademicCalendarScreenState extends State<AcademicCalendarScreen> {
  final CalendarService _calendarService = CalendarService();
  List<dynamic> _holidays = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchHolidays();
  }

  Future<void> _fetchHolidays() async {
    try {
      final holidays = await _calendarService.getHolidays();
      setState(() {
        _holidays = holidays;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading calendar: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Academic Calendar 2026'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _holidays.length,
              itemBuilder: (context, index) {
                final holiday = _holidays[index];
                final startDate = DateTime.parse(holiday['startDate']).toLocal();
                final endDate = DateTime.parse(holiday['endDate']).toLocal();
                final bool isSingleDay = startDate.year == endDate.year &&
                    startDate.month == endDate.month &&
                    startDate.day == endDate.day;

                final dateFormat = DateFormat('d MMMM, yyyy');
                final dateText = isSingleDay
                    ? dateFormat.format(startDate)
                    : '${dateFormat.format(startDate)} - ${dateFormat.format(endDate)}';

                Color typeColor;
                if (holiday['type'] == 'vacation') {
                  typeColor = Colors.purple;
                } else if (holiday['type'] == 'event') {
                  typeColor = Colors.green;
                } else {
                  typeColor = Colors.red;
                }

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.calendar_month, color: Colors.blue),
                    ),
                    title: Text(
                      holiday['title'],
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(dateText, style: TextStyle(color: Colors.grey[700])),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: typeColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                holiday['type'].toString().toUpperCase(),
                                style: TextStyle(color: typeColor, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            if (holiday['classesSuspended'] == false) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.orange.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'CLASSES RUNNING',
                                  style: TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ]
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
