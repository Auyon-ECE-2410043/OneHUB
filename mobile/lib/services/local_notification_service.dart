import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:intl/intl.dart';

class LocalNotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;

    tz.initializeTimeZones();
    // Default to Dhaka
    tz.setLocalLocation(tz.getLocation('Asia/Dhaka'));

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );

    await _notificationsPlugin.initialize(
      settings: initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) async {
        // Handle notification tap
      },
    );

    // Request permissions for Android 13+
    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    _initialized = true;
  }

  static Future<void> scheduleClassReminders(List<dynamic> classes, String role) async {
    await _notificationsPlugin.cancelAll(); // Clear old alarms

    final now = tz.TZDateTime.now(tz.local);
    int notificationId = 0;

    for (var cls in classes) {
      if (cls['startTime'] == null) continue;

      // Parse dayOfWeek and startTime
      // e.g. "Sunday", "10:30"
      final dayString = cls['dayOfWeek'];
      final timeParts = cls['startTime'].split(':');
      if (timeParts.length != 2) continue;

      final hour = int.parse(timeParts[0]);
      final minute = int.parse(timeParts[1]);

      // Calculate the next occurrence of this day and time
      tz.TZDateTime scheduledTime = _nextInstanceOfDayAndTime(dayString, hour, minute);
      
      // We want to remind 5 minutes before class
      tz.TZDateTime reminderTime = scheduledTime.subtract(const Duration(minutes: 5));

      // If the reminder time is in the past, schedule it for next week
      if (reminderTime.isBefore(now)) {
        reminderTime = reminderTime.add(const Duration(days: 7));
      }

      String title;
      String body;

      final formattedTime = DateFormat('h:mm a').format(DateTime(0, 1, 1, hour, minute));

      if (role == 'faculty') {
        title = '⏳ Class starting in 5 mins: ${cls['courseCode']}';
        body = 'Your class with ${cls['series']} starts at $formattedTime in ${cls['roomOrLab']}.';
      } else {
        title = '⏳ Class in 5 Mins: ${cls['courseCode']}';
        final teacher = (cls['teacherInitials'] != null && cls['teacherInitials'].isNotEmpty)
            ? cls['teacherInitials'].join(" & ")
            : "Teacher";
        body = 'Your class starts at $formattedTime in ${cls['roomOrLab']}. Teacher: $teacher.';
      }

      await _notificationsPlugin.zonedSchedule(
        id: notificationId++,
        title: title,
        body: body,
        scheduledDate: reminderTime,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            'class_reminders',
            'Class Reminders',
            channelDescription: 'Notifications for upcoming classes',
            importance: Importance.high,
            priority: Priority.high,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
      );
    }
  }

  static tz.TZDateTime _nextInstanceOfDayAndTime(String dayOfWeek, int hour, int minute) {
    final now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);

    // 1 = Monday, ..., 7 = Sunday
    int targetDay = 1;
    switch (dayOfWeek) {
      case 'Monday': targetDay = 1; break;
      case 'Tuesday': targetDay = 2; break;
      case 'Wednesday': targetDay = 3; break;
      case 'Thursday': targetDay = 4; break;
      case 'Friday': targetDay = 5; break;
      case 'Saturday': targetDay = 6; break;
      case 'Sunday': targetDay = 7; break;
    }

    while (scheduledDate.weekday != targetDay) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}
