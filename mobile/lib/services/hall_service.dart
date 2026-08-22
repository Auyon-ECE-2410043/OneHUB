import 'api_service.dart';

class HallService {
  final ApiService _api = ApiService();

  // Get all hall applications (Admin)
  Future<List<dynamic>> getApplications() async {
    final data = await _api.get('/hall/applications');
    return data['applications'] ?? [];
  }

  // Update application status (Admin)
  Future<Map<String, dynamic>> updateApplicationStatus(String id, String status, {String? allocatedRoom, String? reason}) async {
    final body = <String, dynamic>{'status': status};
    if (allocatedRoom != null) body['allocatedRoomNumber'] = allocatedRoom;
    if (reason != null) body['flaggedReason'] = reason;

    final data = await _api.put('/hall/$id/review', body: body);
    return data['application'];
  }
}
