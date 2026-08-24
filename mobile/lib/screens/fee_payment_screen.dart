// ==========================================
// File: fee_payment_screen.dart
// Description: Flutter screen widget for the fee_payment view.
// ==========================================

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../services/fee_service.dart';
import 'package:intl/intl.dart';

class FeePaymentScreen extends StatefulWidget {
  final String? targetFeeId;
  const FeePaymentScreen({super.key, this.targetFeeId});

  @override
  State<FeePaymentScreen> createState() => _FeePaymentScreenState();
}

class _FeePaymentScreenState extends State<FeePaymentScreen> {
  final FeeService _feeService = FeeService();
  List<dynamic> _fees = [];
  bool _isLoading = true;
  String _userRole = "student";

  @override
  void initState() {
    super.initState();
    _loadUserRole().then((_) => _fetchFees());
  }

  Future<void> _loadUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) {
      final userObj = jsonDecode(userStr);
      setState(() {
        _userRole = userObj['role'] ?? "student";
      });
    }
  }

  Future<void> _fetchFees() async {
    setState(() => _isLoading = true);
    try {
      final fees = await _feeService.getFees();
      setState(() => _fees = fees);
      
      // Auto-open modal if deep-linked
      if (widget.targetFeeId != null && fees.isNotEmpty) {
        final target = fees.firstWhere(
          (f) => f['_id'] == widget.targetFeeId && f['status'] == 'due',
          orElse: () => null,
        );
        if (target != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _showPaymentModal(target as Map<String, dynamic>);
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load fees: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAssignFeeModal() {
    String mode = 'single';
    final rollCtrl = TextEditingController();
    final batchCtrl = TextEditingController();
    final deptCtrl = TextEditingController();
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    DateTime? selectedDate;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
                left: 16,
                right: 16,
                top: 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Assign Custom Fee', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: RadioListTile<String>(
                            title: const Text('Specific Student', style: TextStyle(fontSize: 14)),
                            value: 'single',
                            groupValue: mode,
                            onChanged: (v) => setModalState(() => mode = v!),
                          ),
                        ),
                        Expanded(
                          child: RadioListTile<String>(
                            title: const Text('Whole Series', style: TextStyle(fontSize: 14)),
                            value: 'series',
                            groupValue: mode,
                            onChanged: (v) => setModalState(() => mode = v!),
                          ),
                        ),
                      ],
                    ),
                    if (mode == 'single') ...[
                      TextField(controller: rollCtrl, decoration: const InputDecoration(labelText: 'Roll Number (e.g. 2103001)')),
                    ] else ...[
                      Row(
                        children: [
                          Expanded(child: TextField(controller: batchCtrl, decoration: const InputDecoration(labelText: 'Batch (e.g. 2021)'))),
                          const SizedBox(width: 8),
                          Expanded(child: TextField(controller: deptCtrl, decoration: const InputDecoration(labelText: 'Dept (e.g. CSE)'))),
                        ],
                      ),
                    ],
                    const SizedBox(height: 8),
                    TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Bill Title (e.g. Library Card)')),
                    const SizedBox(height: 8),
                    TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount (৳)')),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Text(selectedDate == null ? 'No Due Date Selected' : 'Due: ${DateFormat('yyyy-MM-dd').format(selectedDate!)}'),
                        ),
                        TextButton(
                          onPressed: () async {
                            final d = await showDatePicker(
                              context: ctx,
                              initialDate: DateTime.now().add(const Duration(days: 30)),
                              firstDate: DateTime.now(),
                              lastDate: DateTime(2030),
                            );
                            if (d != null) setModalState(() => selectedDate = d);
                          },
                          child: const Text('Pick Date'),
                        )
                      ],
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                        onPressed: () async {
                          if (titleCtrl.text.isEmpty || amountCtrl.text.isEmpty || selectedDate == null) {
                            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
                            return;
                          }
                          try {
                            await _feeService.assignFee({
                              'mode': mode,
                              'rollNo': rollCtrl.text.trim(),
                              'batch': batchCtrl.text.trim(),
                              'department': deptCtrl.text.trim(),
                              'label': titleCtrl.text.trim(),
                              'amount': double.parse(amountCtrl.text.trim()),
                              'dueDate': selectedDate!.toIso8601String(),
                            });
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fee Assigned Successfully')));
                            _fetchFees();
                          } catch (e) {
                            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
                          }
                        },
                        child: const Text('Assign Fee', style: TextStyle(fontSize: 16)),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showPaymentModal(Map<String, dynamic> fee) {
    String selectedMethod = 'bKash';

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Pay ${fee['label']}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Amount: ৳${fee['amount']}',
                style: TextStyle(fontSize: 18, color: Theme.of(context).primaryColor, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              const Text('Select Payment Method', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: selectedMethod,
                decoration: const InputDecoration(border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'bKash', child: Text('bKash')),
                  DropdownMenuItem(value: 'Nagad', child: Text('Nagad')),
                  DropdownMenuItem(value: 'Sonali Bank', child: Text('Sonali Bank')),
                ],
                onChanged: (val) => setModalState(() => selectedMethod = val!),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  try {
                    await _feeService.payFee(fee['_id'], selectedMethod);
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Payment Successful!')),
                      );
                      _fetchFees();
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed: $e')),
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Confirm Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReceipt(String feeId) async {
    try {
      final baseUrl = dotenv.env['API_URL'] ?? 'http://10.0.2.2:5000/api';
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      
      // We pass token in query since we are opening in browser
      final url = Uri.parse('$baseUrl/fees/$feeId/receipt?token=$token');
      
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw Exception('Could not launch PDF viewer');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load receipt: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee & Payment'),
      ),
      floatingActionButton: _userRole == 'admin' ? FloatingActionButton.extended(
        onPressed: _showAssignFeeModal,
        icon: const Icon(Icons.add),
        label: const Text('Assign Fee'),
      ) : null,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _fees.isEmpty
              ? const Center(child: Text('No fee records found.'))
              : RefreshIndicator(
                  onRefresh: _fetchFees,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _fees.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final fee = _fees[index];
                      final isPaid = fee['status'] == 'paid';

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
                                    fee['label'],
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isPaid ? Colors.green.shade50 : Colors.red.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isPaid ? 'PAID' : 'UNPAID',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: isPaid ? Colors.green.shade700 : Colors.red.shade700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Amount: ৳${fee['amount']}',
                                style: const TextStyle(fontSize: 16),
                              ),
                              if (isPaid && fee['paidAt'] != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  'Paid on: ${DateFormat('MMM d, yyyy').format(DateTime.parse(fee['paidAt']).toLocal())}',
                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                ),
                              ],
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  if (!isPaid)
                                    ElevatedButton(
                                      onPressed: () => _showPaymentModal(fee),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.blue,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Pay Now'),
                                    ),
                                  if (isPaid)
                                    OutlinedButton.icon(
                                      onPressed: () => _showReceipt(fee['_id']),
                                      icon: const Icon(Icons.receipt_long, size: 16),
                                      label: const Text('View Receipt'),
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
