// ==========================================
// File: calendar_service.dart
// Description: Flutter service class handling API requests for calendar.
// ==========================================

import 'api_service.dart';

class CalendarService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getHolidays() async {
    final data = await _api.get('/calendar/holidays');
    return data['holidays'] ?? [];
  }
}
