const fs = require('fs');

const code = \import 'package:flutter/material.dart';
import '../services/student_service.dart';

class MedicalCenterScreen extends StatefulWidget {
  const MedicalCenterScreen({super.key});

  @override
  State<MedicalCenterScreen> createState() => _MedicalCenterScreenState();
}

class _MedicalCenterScreenState extends State<MedicalCenterScreen> {
  String _activeTab = 'directory'; // directory, appointments, blood-directory

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50
      appBar: AppBar(
        title: const Text('Medical Center', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF1F5F9)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2))
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Medical Center', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                const SizedBox(height: 4),
                const Text('Access RUET Health Complex directory, book appointments, and find blood donors.', style: TextStyle(color: Color(0xFF64748B))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9), // slate-100
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      _buildTabButton('directory', 'Directory', Icons.info_outline, const Color(0xFF059669)), // emerald-600
                      _buildTabButton('appointments', 'Appointments', Icons.calendar_today, const Color(0xFF0284C7)), // sky-600
                      _buildTabButton('blood-directory', 'Blood', Icons.water_drop, const Color(0xFFE11D48)), // rose-600
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _activeTab == 'directory' 
                ? const _DirectoryTab() 
                : _activeTab == 'appointments' 
                    ? const _AppointmentsTab() 
                    : const _BloodDirectoryTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(String id, String label, IconData icon, Color activeColor) {
    final isActive = _activeTab == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isActive ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 2)] : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: isActive ? activeColor : const Color(0xFF475569)),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isActive ? activeColor : const Color(0xFF475569),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DirectoryTab extends StatelessWidget {
  const _DirectoryTab();

  @override
  Widget build(BuildContext context) {
    final doctors = [
      {'unit': 'Pathology Unit', 'doctor': 'Md. Altab Hossain', 'role': 'Assistant Principal Medical Technologist'},
      {'unit': 'Medicine Unit', 'doctor': 'Dr. Farhana Tanjin', 'role': 'Medical Officer'},
      {'unit': 'Emergency & First Aid', 'doctor': 'Dr. Md. Ali Asgar', 'role': 'Chief Medical Officer'},
      {'unit': 'Pharmacy', 'doctor': 'K. M. Hasan Ali', 'role': 'Pharmacist'},
      {'unit': 'Ambulance Service', 'doctor': 'Hotline', 'role': '01323880424'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: doctors.length,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)), // slate-200
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5), // emerald-50
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.business, color: Color(0xFF059669)), // emerald-600
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(doctors[index]['unit']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
                    const SizedBox(height: 4),
                    Text(doctors[index]['doctor']!, style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w500)),
                    const SizedBox(height: 2),
                    Text(doctors[index]['role']!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AppointmentsTab extends StatefulWidget {
  const _AppointmentsTab();

  @override
  State<_AppointmentsTab> createState() => _AppointmentsTabState();
}

class _AppointmentsTabState extends State<_AppointmentsTab> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  List<dynamic> _appointments = [];

  @override
  void initState() {
    super.initState();
    _fetchAppointments();
  }

  Future<void> _fetchAppointments() async {
    setState(() => _isLoading = true);
    try {
      final data = await _studentService.getMedicalAppointments();
      setState(() => _appointments = data);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: \')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showBookDialog() {
    final doctorCtrl = TextEditingController();
    final dateCtrl = TextEditingController();
    final timeCtrl = TextEditingController();
    final symptomsCtrl = TextEditingController();
    
    // Instead of simple dialog, mimicking a nice bottom sheet or form
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          top: 24,
          left: 24,
          right: 24,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Book Appointment', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildInput('Doctor Name (Optional)', doctorCtrl, Icons.person_outline),
              const SizedBox(height: 12),
              _buildInput('Date (YYYY-MM-DD)', dateCtrl, Icons.calendar_today),
              const SizedBox(height: 12),
              _buildInput('Time Slot (e.g., 10:00 AM)', timeCtrl, Icons.access_time),
              const SizedBox(height: 12),
              _buildInput('Symptoms / Reason', symptomsCtrl, Icons.healing),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7), // sky-600
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () async {
                    try {
                      await _studentService.bookMedicalAppointment({
                        'doctorName': doctorCtrl.text,
                        'appointmentDate': dateCtrl.text,
                        'timeSlot': timeCtrl.text,
                        'symptoms': symptomsCtrl.text,
                      });
                      Navigator.pop(context);
                      _fetchAppointments();
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Appointment booked successfully!')));
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                    }
                  },
                  child: const Text('Confirm Booking', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, IconData icon) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF94A3B8)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showBookDialog,
        backgroundColor: const Color(0xFF0284C7),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Book', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _appointments.isEmpty
              ? const Center(child: Text('No medical appointments found.', style: TextStyle(color: Color(0xFF64748B))))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8).copyWith(bottom: 80),
                  itemCount: _appointments.length,
                  itemBuilder: (context, index) {
                    final appt = _appointments[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(appt['doctorName']?.isNotEmpty == true ? appt['doctorName'] : 'General Physician', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: appt['status'] == 'completed' ? const Color(0xFFDCFCE7) : const Color(0xFFFEF9C3),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  (appt['status'] ?? 'pending').toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: appt['status'] == 'completed' ? const Color(0xFF166534) : const Color(0xFF854D0E),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(appt['appointmentDate']?.toString().split('T')[0] ?? '', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                              const SizedBox(width: 16),
                              const Icon(Icons.access_time, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(appt['timeSlot'] ?? '', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Divider(),
                          const SizedBox(height: 4),
                          Text('Reason: \', style: const TextStyle(color: Color(0xFF475569))),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}

class _BloodDirectoryTab extends StatefulWidget {
  const _BloodDirectoryTab();

  @override
  State<_BloodDirectoryTab> createState() => _BloodDirectoryTabState();
}

class _BloodDirectoryTabState extends State<_BloodDirectoryTab> {
  final StudentService _studentService = StudentService();
  bool _isLoading = true;
  List<dynamic> _donors = [];
  String _searchGroup = '';

  @override
  void initState() {
    super.initState();
    _fetchDonors();
  }

  Future<void> _fetchDonors() async {
    setState(() => _isLoading = true);
    try {
      final data = await _studentService.getBloodDirectory(_searchGroup.isEmpty ? null : _searchGroup);
      setState(() => _donors = data);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: \')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    labelText: 'Search Blood Group (e.g. O+)',
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                  onChanged: (val) => _searchGroup = val,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFE11D48), // rose-600
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.search, color: Colors.white),
                  onPressed: _fetchDonors,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _donors.isEmpty
                  ? const Center(child: Text('No donors found.', style: TextStyle(color: Color(0xFF64748B))))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _donors.length,
                      itemBuilder: (context, index) {
                        final donor = _donors[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF1F2), // rose-50
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Center(
                                  child: Text(
                                    donor['bloodGroup'] ?? '?', 
                                    style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold, fontSize: 16)
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(donor['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
                                    const SizedBox(height: 4),
                                    Text('Batch \ • \', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.phone, color: Color(0xFF94A3B8)),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Call \')));
                                },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
\;
fs.writeFileSync('mobile/lib/screens/medical_center_screen.dart', code);
