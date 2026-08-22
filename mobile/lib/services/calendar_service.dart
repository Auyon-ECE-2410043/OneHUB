import 'api_service.dart';

class CalendarService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getHolidays() async {
    final data = await _api.get('/calendar/holidays');
    return data['holidays'] ?? [];
  }
}
