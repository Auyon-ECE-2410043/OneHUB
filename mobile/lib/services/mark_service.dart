import 'api_service.dart';

class MarkService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> submitMark(Map<String, dynamic> markData) async {
    final data = await _api.post('/marks', body: markData);
    return data['mark'];
  }

  // Fetch student's results
  Future<Map<String, dynamic>> getAcademicSummary() async {
    return await _api.get('/marks/academic-summary');
  }
}
