import 'api_service.dart';

class NoticeService {
  final ApiService _api = ApiService();

  // Fetch all notices
  Future<List<dynamic>> getNotices() async {
    final data = await _api.get('/notices');
    return data['notices'] ?? [];
  }

  // Create a new notice
  Future<Map<String, dynamic>> createNotice(Map<String, dynamic> noticeData) async {
    final data = await _api.post('/notices', body: noticeData);
    return data['notice'];
  }

  // Delete a notice
  Future<void> deleteNotice(String id) async {
    await _api.delete('/notices/$id');
  }
}
