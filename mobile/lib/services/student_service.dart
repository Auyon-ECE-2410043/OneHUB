// ==========================================
// File: student_service.dart
// Description: Flutter service class handling API requests for student.
// ==========================================

import 'api_service.dart';

class StudentService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getRoutine(String dept, String semester) async {
    return await _api.get('/routine?department=$dept&semester=$semester');
  }

  Future<Map<String, dynamic>> getMyWeeklyRoutine() async {
    return await _api.get('/routine/my-week');
  }

  Future<Map<String, dynamic>> getMyHallApplication() async {
    try {
      final res = await _api.get('/hall/my-application');
      return res['application'];
    } catch (e) {
      return {};
    }
  }

  Future<Map<String, dynamic>> applyHall(Map<String, dynamic> body) async {
    return await _api.post('/hall/apply', body: body);
  }

  Future<Map<String, dynamic>> getClearanceStatus(String semester) async {
    try {
      final res = await _api.get('/clearance?semester=$semester');
      return res['clearance'] ?? {};
    } catch (e) {
      return {};
    }
  }

  Future<List<dynamic>> getMedicalAppointments() async {
    final res = await _api.get('/medical/appointments');
    return res['appointments'] ?? [];
  }
}
