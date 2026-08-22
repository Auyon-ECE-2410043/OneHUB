import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  late Dio _dio;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: dotenv.env['API_URL'] ?? 'http://10.0.2.2:5000/api',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        responseType: ResponseType.json,
      ),
    );

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // You can handle global 401 unauth errors here
          return handler.next(e);
        },
      ),
    );
  }

  Future<dynamic> get(String endpoint, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(endpoint, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
    }
  }

  Future<dynamic> post(String endpoint, {dynamic body}) async {
    try {
      final response = await _dio.post(endpoint, data: body);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
    }
  }

  Future<dynamic> put(String endpoint, {dynamic body}) async {
    try {
      final response = await _dio.put(endpoint, data: body);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
    }
  }

  Future<dynamic> delete(String endpoint) async {
    try {
      final response = await _dio.delete(endpoint);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
    }
  }

  void _handleError(DioException e) {
    String errorMessage = 'An error occurred';
    if (e.response != null && e.response?.data != null) {
      final data = e.response?.data;
      if (data is Map) {
        errorMessage = data['error'] ?? data['message'] ?? errorMessage;
      }
    } else {
      errorMessage = e.message ?? 'Network Error';
    }
    throw Exception(errorMessage);
  }
}
