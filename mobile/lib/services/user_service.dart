// ==========================================
// File: user_service.dart
// Description: Flutter service class handling API requests for user.
// ==========================================

import 'api_service.dart';

class UserService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getFaculty() async {
    final data = await _api.get('/faculty?limit=100');
    if (data is List) return data;
    if (data is Map) return data['faculty'] ?? [];
    return [];
  }

  Future<Map<String, dynamic>> createFaculty(Map<String, dynamic> facultyData) async {
    final data = await _api.post('/faculty', body: facultyData);
    return data['faculty'];
  }

  Future<List<dynamic>> searchStudents(String query) async {
    final url = query.isEmpty ? '/students' : '/students?search=${Uri.encodeComponent(query)}';
    final data = await _api.get(url);
    return data['students'] ?? [];
  }
}
