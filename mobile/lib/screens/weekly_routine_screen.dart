// ==========================================
// File: weekly_routine_screen.dart
// Description: Renders the weekly class routine in a native Flutter calendar view.
// ==========================================

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../services/student_service.dart';
import '../widgets/up_next_class_widget.dart';

class WeeklyRoutineScreen extends StatefulWidget {
  const WeeklyRoutineScreen({super.key});

  @override
  State<WeeklyRoutineScreen> createState() => _WeeklyRoutineScreenState();
}

class _WeeklyRoutineScreenState extends State<WeeklyRoutineScreen> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  List<dynamic> _routine = [];
  final ScrollController _horizontalScrollController = ScrollController();

  final List<String> days = [
    "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ];

  final List<Map<String, dynamic>> timeSlots = [
    {"label": "08:00 - 08:50", "start": "08:00", "end": "08:50", "isBreak": false},
    {"label": "08:50 - 09:40", "start": "08:50", "end": "09:40", "isBreak": false},
    {"label": "09:40 - 10:30", "start": "09:40", "end": "10:30", "isBreak": false},
    {"label": "10:30 - 10:50", "start": "10:30", "end": "10:50", "isBreak": true},
    {"label": "10:50 - 11:40", "start": "10:50", "end": "11:40", "isBreak": false},
    {"label": "11:40 - 12:30", "start": "11:40", "end": "12:30", "isBreak": false},
    {"label": "12:30 - 01:20", "start": "12:30", "end": "01:20", "isBreak": false},
    {"label": "01:20 - 02:30", "start": "01:20", "end": "02:30", "isBreak": true},
    {"label": "02:30 - 03:20", "start": "02:30", "end": "03:20", "isBreak": false},
    {"label": "03:20 - 04:10", "start": "03:20", "end": "04:10", "isBreak": false},
    {"label": "04:10 - 05:00", "start": "04:10", "end": "05:00", "isBreak": false},
  ];

  final double hourHeight = 110.0;
  final double dayWidth = 140.0;
  final double timeColumnWidth = 70.0;

  @override
  void initState() {
    super.initState();
    _fetchRoutine();
    
    // Auto-scroll to today
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_horizontalScrollController.hasClients) {
        final now = DateTime.now();
        final weekdayMap = {6: "Saturday", 7: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"};
        final todayStr = weekdayMap[now.weekday] ?? "Saturday";
        int dayIndex = days.indexOf(todayStr);
        if (dayIndex != -1) {
          // Calculate offset: time column width + previous days width
          double offset = (dayIndex * dayWidth);
          _horizontalScrollController.animateTo(
            offset,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
        }
      }
    });
  }

  @override
  void dispose() {
    _horizontalScrollController.dispose();
    super.dispose();
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

  int timeToMinutes(String timeStr) {
    List<String> parts = timeStr.split(':');
    if (parts.length != 2) return 0;
    int h = int.tryParse(parts[0]) ?? 0;
    int m = int.tryParse(parts[1]) ?? 0;
    if (h >= 1 && h <= 7) h += 12;
    return (h * 60 + m) - (8 * 60);
  }

  Map<String, double> getSlotStyle(String start, String end) {
    int startMins = timeToMinutes(start);
    int endMins = timeToMinutes(end);
    double top = (startMins / 60) * hourHeight;
    double height = ((endMins - startMins) / 60) * hourHeight;
    return {"top": top, "height": height};
  }

  @override
  Widget build(BuildContext context) {
    double totalHeight = (9 * hourHeight); // 8am to 5pm

    final now = DateTime.now();
    final weekdayMap = {6: "Saturday", 7: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"};
    final todayStr = weekdayMap[now.weekday];

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Routine')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.all(12.0),
                  child: UpNextClassWidget(),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      controller: _horizontalScrollController,
                      scrollDirection: Axis.horizontal,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header Row
                    Row(
                      children: [
                        Container(
                          width: timeColumnWidth,
                          height: 50,
                          decoration: const BoxDecoration(
                            border: Border(right: BorderSide(color: Colors.grey, width: 0.5), bottom: BorderSide(color: Colors.grey, width: 0.5))
                          ),
                        ),
                        ...days.map((day) {
                          bool isToday = day == todayStr;
                          return Container(
                            width: dayWidth,
                            height: 50,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isToday ? Colors.blue.withOpacity(0.1) : Colors.transparent,
                              border: const Border(
                                right: BorderSide(color: Colors.grey, width: 0.5), 
                                bottom: BorderSide(color: Colors.grey, width: 0.5)
                              )
                            ),
                            child: Text(
                              day, 
                              style: TextStyle(
                                fontWeight: FontWeight.bold, 
                                color: isToday ? Colors.blue.shade900 : Colors.blueGrey
                              )
                            ),
                          );
                        })
                      ],
                    ),
                    // Grid Body
                    SizedBox(
                      height: totalHeight,
                      width: timeColumnWidth + (dayWidth * days.length),
                      child: Stack(
                        children: [
                          // Background Grid Lines & Breaks
                          ...timeSlots.map((slot) {
                            final style = getSlotStyle(slot['start'], slot['end']);
                            return Positioned(
                              top: style['top'],
                              left: 0,
                              right: 0,
                              height: style['height'],
                              child: Row(
                                children: [
                                  Container(
                                    width: timeColumnWidth,
                                    decoration: const BoxDecoration(
                                      border: Border(top: BorderSide(color: Colors.grey, width: 0.5), right: BorderSide(color: Colors.grey, width: 0.5)),
                                    ),
                                    padding: const EdgeInsets.only(right: 4),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(slot['label'].split(' - ')[0], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                        const Text('to', style: TextStyle(fontSize: 8, color: Colors.grey)),
                                        Text(slot['label'].split(' - ')[1], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: slot['isBreak'] ? Colors.grey.shade200 : Colors.transparent,
                                        border: Border(
                                          top: const BorderSide(color: Colors.grey, width: 0.5),
                                          bottom: slot['isBreak'] ? const BorderSide(color: Colors.grey, width: 0.5) : BorderSide.none
                                        )
                                      ),
                                      alignment: Alignment.center,
                                      child: slot['isBreak'] ? Text(slot['label'].contains('01:20') ? 'LUNCH BREAK' : 'TEA BREAK', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 2)) : null,
                                    ),
                                  ),
                                ],
                              )
                            );
                          }),

                          // Day Column Borders
                          ...List.generate(days.length, (index) {
                            return Positioned(
                              top: 0,
                              bottom: 0,
                              left: timeColumnWidth + (index * dayWidth),
                              width: dayWidth,
                              child: Container(
                                decoration: const BoxDecoration(
                                  border: Border(right: BorderSide(color: Colors.grey, width: 0.5))
                                ),
                              ),
                            );
                          }),

                          // Classes
                          ..._routine.map((c) {
                            String dayOfWeek = c['dayOfWeek'] ?? '';
                            int dayIndex = days.indexOf(dayOfWeek);
                            if (dayIndex == -1) return const SizedBox.shrink();

                            final style = getSlotStyle(c['startTime'], c['endTime']);
                            bool isSessional = c['type']?.toLowerCase() == 'sessional';

                            return Positioned(
                              top: style['top'],
                              left: timeColumnWidth + (dayIndex * dayWidth) + 4,
                              width: dayWidth - 8,
                              height: style['height']! - 2,
                              child: Card(
                                color: isSessional ? Colors.indigo.shade50 : Colors.lightBlue.shade50,
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: BorderSide(color: isSessional ? Colors.indigo.shade300 : Colors.lightBlue.shade300, width: 1.5)
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(4.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        c['courseCode'] ?? '',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isSessional ? Colors.indigo.shade900 : Colors.lightBlue.shade900),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        '${c['startTime']} - ${c['endTime']}',
                                        style: TextStyle(fontSize: 10, color: isSessional ? Colors.indigo.shade700 : Colors.lightBlue.shade700),
                                      ),
                                      const Spacer(),
                                      Row(
                                        children: [
                                          Icon(Icons.location_on, size: 12, color: isSessional ? Colors.indigo.shade700 : Colors.lightBlue.shade700),
                                          const SizedBox(width: 2),
                                          Expanded(child: Text(c['roomOrLab'] ?? '', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSessional ? Colors.indigo.shade700 : Colors.lightBlue.shade700), overflow: TextOverflow.ellipsis)),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          Icon(Icons.person, size: 12, color: isSessional ? Colors.indigo.shade700 : Colors.lightBlue.shade700),
                                          const SizedBox(width: 2),
                                          Expanded(child: Text((c['teacherInitials'] as List<dynamic>?)?.join(', ') ?? '', style: TextStyle(fontSize: 10, color: isSessional ? Colors.indigo.shade700 : Colors.lightBlue.shade700), overflow: TextOverflow.ellipsis)),
                                        ],
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ).animate().fade(duration: 500.ms).slideY(begin: 0.05, end: 0),
    );
  }
}
