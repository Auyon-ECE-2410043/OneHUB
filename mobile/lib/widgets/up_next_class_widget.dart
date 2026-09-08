import 'dart:async';
import 'package:flutter/material.dart';
import '../services/student_service.dart';

class UpNextClassWidget extends StatefulWidget {
  const UpNextClassWidget({super.key});

  @override
  State<UpNextClassWidget> createState() => _UpNextClassWidgetState();
}

class _UpNextClassWidgetState extends State<UpNextClassWidget> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  Map<String, dynamic>? _nextClass;
  Duration? _timeUntilNext;
  Timer? _timer;

  final List<String> days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  @override
  void initState() {
    super.initState();
    _fetchRoutineAndCalculate();
    // Update the countdown every minute
    _timer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (_nextClass != null) {
        _calculateTimeUntilNext(_nextClass!);
      } else {
        _fetchRoutineAndCalculate();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchRoutineAndCalculate() async {
    try {
      final data = await _studentService.getMyWeeklyRoutine();
      List<dynamic> routine = data['routine'] ?? [];
      
      _findNextClass(routine);
    } catch (e) {
      // Handle silently or log
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _findNextClass(List<dynamic> routine) {
    if (routine.isEmpty) return;

    final now = DateTime.now();
    final today = days[now.weekday == 7 ? 0 : now.weekday]; // DateTime.weekday is 1 (Mon) - 7 (Sun)
    
    // Sort all classes today by start time
    List<dynamic> todayClasses = routine.where((c) => c['dayOfWeek'] == today).toList();
    todayClasses.sort((a, b) => a['startTime'].compareTo(b['startTime']));

    Map<String, dynamic>? upcoming;

    for (var c in todayClasses) {
      final timeParts = c['startTime'].toString().split(':');
      if (timeParts.length == 2) {
        int hour = int.tryParse(timeParts[0]) ?? 0;
        int minute = int.tryParse(timeParts[1]) ?? 0;
        
        final classTime = DateTime(now.year, now.month, now.day, hour, minute);
        
        // If class starts in the future, or started within the last 50 minutes (still ongoing)
        if (classTime.isAfter(now)) {
          upcoming = c;
          break;
        } else if (now.difference(classTime).inMinutes < 50) {
          // It's currently happening, but let's consider it the "current" class and look for the next one
          // Actually, we can show "Happening Now"
          upcoming = c;
          break;
        }
      }
    }

    if (mounted) {
      setState(() {
        _nextClass = upcoming;
        if (upcoming != null) {
          _calculateTimeUntilNext(upcoming);
        }
      });
    }
  }

  void _calculateTimeUntilNext(Map<String, dynamic> c) {
    final now = DateTime.now();
    final timeParts = c['startTime'].toString().split(':');
    if (timeParts.length == 2) {
      int hour = int.tryParse(timeParts[0]) ?? 0;
      int minute = int.tryParse(timeParts[1]) ?? 0;
      
      final classTime = DateTime(now.year, now.month, now.day, hour, minute);
      
      if (mounted) {
        setState(() {
          if (classTime.isAfter(now)) {
            _timeUntilNext = classTime.difference(now);
          } else {
            _timeUntilNext = null; // Happening now
          }
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (_nextClass == null) {
      return Card(
        color: Colors.green.shade50,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.green.shade200),
        ),
        child: const Padding(
          padding: EdgeInsets.all(16.0),
          child: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  "No more classes today! Enjoy your free time.",
                  style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      );
    }

    bool isHappeningNow = _timeUntilNext == null;
    String timeText = isHappeningNow 
        ? "Happening Now" 
        : "Starts in ${_timeUntilNext!.inMinutes} mins";

    bool isSessional = _nextClass!['type']?.toLowerCase() == 'sessional';
    MaterialColor mainColor = isSessional ? Colors.indigo : Colors.blue;

    return Card(
      elevation: 4,
      shadowColor: mainColor.withOpacity(0.4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [mainColor.shade700, mainColor.shade500],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      timeText,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                  const Icon(Icons.notifications_active, color: Colors.white, size: 20),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                _nextClass!['courseCode'] ?? 'Unknown Course',
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.access_time, color: Colors.white70, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    '${_nextClass!['startTime']} - ${_nextClass!['endTime']}',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.location_on, color: Colors.white70, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    _nextClass!['roomOrLab'] ?? 'TBA',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person, color: Colors.white70, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      (_nextClass!['teacherInitials'] as List<dynamic>?)?.join(', ') ?? 'TBA',
                      style: const TextStyle(color: Colors.white70, fontSize: 14),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
