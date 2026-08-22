import 'package:flutter/material.dart';
import '../services/hall_service.dart';

class HallApplicationsScreen extends StatefulWidget {
  const HallApplicationsScreen({super.key});

  @override
  State<HallApplicationsScreen> createState() => _HallApplicationsScreenState();
}

class _HallApplicationsScreenState extends State<HallApplicationsScreen> {
  final HallService _hallService = HallService();
  List<dynamic> _applications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchApps();
  }

  Future<void> _fetchApps() async {
    setState(() => _isLoading = true);
    try {
      final apps = await _hallService.getApplications();
      setState(() => _applications = apps);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load hall applications: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showActionModal(Map<String, dynamic> app) {
    String action = 'approved';
    final roomController = TextEditingController();
    final reasonController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Review ${app['fullName']}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: action,
                  decoration: const InputDecoration(labelText: 'Action'),
                  items: const [
                    DropdownMenuItem(value: 'approved', child: Text('Approve Application')),
                    DropdownMenuItem(value: 'rejected', child: Text('Reject Application')),
                    DropdownMenuItem(value: 'flagged_ineligible', child: Text('Flag as Ineligible')),
                  ],
                  onChanged: (val) => setModalState(() => action = val!),
                ),
                const SizedBox(height: 16),
                if (action == 'approved')
                  TextField(
                    controller: roomController,
                    decoration: const InputDecoration(labelText: 'Allocated Room Number (e.g. A-102)'),
                  ),
                if (action == 'rejected' || action == 'flagged_ineligible')
                  TextField(
                    controller: reasonController,
                    decoration: const InputDecoration(labelText: 'Reason for Rejection/Flag'),
                  ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      await _hallService.updateApplicationStatus(
                        app['_id'], 
                        action,
                        allocatedRoom: action == 'approved' ? roomController.text : null,
                        reason: (action == 'rejected' || action == 'flagged_ineligible') ? reasonController.text : null,
                      );
                      if (context.mounted) Navigator.pop(context);
                      _fetchApps();
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Failed: $e')),
                        );
                      }
                    }
                  },
                  child: const Text('Submit Review'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hall Applications'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _applications.isEmpty
              ? const Center(child: Text('No applications found.'))
              : RefreshIndicator(
                  onRefresh: _fetchApps,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _applications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final app = _applications[index];
                      final status = app['status'];

                      Color statusColor = Colors.orange;
                      if (status == 'approved') statusColor = Colors.green;
                      if (status == 'rejected' || status == 'flagged_ineligible') statusColor = Colors.red;

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    app['fullName'],
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      status.toString().toUpperCase().replaceAll('_', ' '),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: statusColor,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Roll: ${app['rollNo']} • Dept: ${app['department']} • CGPA: ${app['cgpa']}',
                                style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Category: ${app['category']}\nPreferred Hall: ${app['preferredHall']}',
                                style: const TextStyle(fontSize: 14),
                              ),
                              if (app['allocatedRoomNumber'] != null) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Room Allocated: ${app['allocatedRoomNumber']}',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green),
                                ),
                              ],
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  ElevatedButton(
                                    onPressed: () => _showActionModal(app),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Theme.of(context).primaryColor,
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text('Review Application'),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
