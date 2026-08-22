import 'api_service.dart';

class CourseService {
  final ApiService _api = ApiService();

  // Fetch all courses (Admin / Global)
  Future<List<dynamic>> getAllCourses() async {
    final data = await _api.get('/courses/all?limit=100');
    if (data is List) return data;
    if (data is Map) return data['courses'] ?? [];
    return [];
  }

  // Create a new course (Admin)
  Future<Map<String, dynamic>> createCourse(Map<String, dynamic> courseData) async {
    final data = await _api.post('/courses', body: courseData);
    return data['course'];
  }

  // Fetch pending registrations (Admin / Faculty)
  Future<List<dynamic>> getPendingRegistrations() async {
    final data = await _api.get('/registrations/pending');
    return data['registrations'] ?? [];
  }

  // Approve or Reject registration (Admin / Faculty)
  Future<Map<String, dynamic>> updateRegistrationStatus(String id, String status) async {
    final data = await _api.put('/registrations/$id/status', body: {'status': status});
    return data;
  }

  // Fetch student's assigned courses
  Future<Map<String, dynamic>> getAssignedCourses() async {
    return await _api.get('/courses/assigned');
  }

  // Fetch student's active registration
  Future<Map<String, dynamic>?> getActiveRegistration() async {
    try {
      final data = await _api.get('/registrations/active');
      return data['registration'];
    } catch (e) {
      // 404 means no active registration
      return null;
    }
  }

  // Submit registration request (Student)
  Future<Map<String, dynamic>> submitRegistration(String semester, List<String> backlogIds) async {
    return await _api.post('/registrations', body: {
      'semester': semester,
      'backlogCourseIds': backlogIds,
    });
  }
}
