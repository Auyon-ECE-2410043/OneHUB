// ==========================================
// File: fee_service.dart
// Description: Flutter service class handling API requests for fee.
// ==========================================

import 'api_service.dart';

class FeeService {
  final ApiService _api = ApiService();

  // Get all fees (dues and paid) for the student
  Future<List<dynamic>> getFees() async {
    final data = await _api.get('/fees');
    return data['fees'] ?? [];
  }

  // Pay a fee
  Future<Map<String, dynamic>> payFee(String feeId, String paymentMethod) async {
    final data = await _api.post('/fees/$feeId/pay', body: {'paymentMethod': paymentMethod});
    return data['fee'];
  }

  // Get receipt data
  Future<Map<String, dynamic>> getReceipt(String feeId) async {
    return await _api.get('/fees/$feeId/receipt');
  }
}
