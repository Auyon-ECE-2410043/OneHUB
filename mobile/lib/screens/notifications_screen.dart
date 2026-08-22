import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List<dynamic> _notifications = [];

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    try {
      final res = await _api.get('/notifications');
      setState(() {
        _notifications = res['notifications'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await _api.put('/notifications/$id/read');
      _fetchNotifications(); // Refresh list
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _api.put('/notifications/read-all');
      _fetchNotifications();
    } catch (e) {
      // Ignore
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: _markAllAsRead,
            child: const Text('Mark All Read', style: TextStyle(color: Colors.white)),
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No new notifications.'))
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notif = _notifications[index];
                    final isRead = notif['isRead'] ?? true;
                    return ListTile(
                      tileColor: isRead ? null : Colors.blue.withOpacity(0.1),
                      leading: Icon(
                        isRead ? Icons.notifications_none : Icons.notifications_active,
                        color: isRead ? Colors.grey : Colors.blue,
                      ),
                      title: Text(
                        notif['title'] ?? 'Notification',
                        style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                      ),
                      subtitle: Text(notif['message'] ?? ''),
                      onTap: () {
                        if (!isRead) _markAsRead(notif['_id']);
                      },
                    );
                  },
                ),
    );
  }
}
