// ==========================================
// File: home_screen.dart
// Description: The main landing screen of the mobile app showing dashboard metrics.
// ==========================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

import 'notice_board_screen.dart';
import 'faculty_directory_screen.dart';
import 'manage_users_screen.dart';
import 'course_management_screen.dart';
import 'registration_approvals_screen.dart';
import 'student_registration_screen.dart';
import 'fee_payment_screen.dart';
import 'hall_applications_screen.dart';
import 'course_assignments_screen.dart';
import 'mark_entry_screen.dart';
import 'my_results_screen.dart';
import 'my_profile_screen.dart';
import 'my_courses_screen.dart';
import 'weekly_routine_screen.dart';
import 'attendance_record_screen.dart';
import 'student_hall_screen.dart';
import 'clearance_status_screen.dart';
import 'medical_center_screen.dart';
import 'faculty_attendance_screen.dart';
import 'academic_calendar_screen.dart';

import 'notifications_screen.dart';
import '../services/api_service.dart';
import '../services/local_notification_service.dart';

class NotificationBell extends StatefulWidget {
  const NotificationBell({super.key});

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchCount();
    _scheduleRoutineNotifications();
  }

  Future<void> _scheduleRoutineNotifications() async {
    try {
      final user = context.read<AuthProvider>().user;
      final role = user?['role'] ?? 'student';
      final res = await ApiService().get('/routine/my-week');
      if (res['routine'] != null) {
        await LocalNotificationService.scheduleClassReminders(res['routine'], role);
      }
    } catch (_) {}
  }

  Future<void> _fetchCount() async {
    try {
      final res = await ApiService().get('/notifications');
      if (mounted) {
        setState(() {
          _unreadCount = res['unreadCount'] ?? 0;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.notifications),
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const NotificationsScreen()),
            );
            _fetchCount(); // Refresh count when coming back
          },
        ),
        if (_unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(10),
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                '$_unreadCount',
                style: const TextStyle(color: Colors.white, fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('OneHUB Dashboard'),
        actions: [
          const NotificationBell(),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthProvider>().logout();
            },
          ),
        ],
      ),
      body: user == null 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                'Welcome, ${user['name']}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'ID: ${user['rollNo'] ?? 'Admin'} • ${user['department'] ?? 'Administration'}',
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 24),
              
              if (user['role'] == 'admin' || user['role'] == 'student' || user['role'] == 'faculty') ...[
                const Text(
                  'Quick Statistics',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      if (user['role'] == 'admin') ...[
                        _buildStatCard(
                          'Pending Registrations', 
                          '0', 
                          Icons.pending_actions, 
                          Colors.orange,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegistrationApprovalsScreen())),
                        ),
                        _buildStatCard(
                          'Active Courses', 
                          '24', 
                          Icons.book, 
                          Colors.blue,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CourseManagementScreen())),
                        ),
                        _buildStatCard(
                          'Hall Applications', 
                          '3', 
                          Icons.apartment, 
                          Colors.purple,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HallApplicationsScreen())),
                        ),
                        _buildStatCard(
                          'Total Faculty', 
                          '20', 
                          Icons.people, 
                          Colors.teal,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FacultyDirectoryScreen())),
                        ),
                      ],
                      if (user['role'] == 'student') ...[
                        _buildStatCard('Course Credits', '0', Icons.menu_book, Colors.blue),
                        _buildStatCard('Registration', 'Approved', Icons.schedule, Colors.green),
                        _buildStatCard('Fee Dues', '৳ 0', Icons.credit_card, Colors.orange),
                        _buildStatCard('Hall Portal', 'Allocated', Icons.apartment, Colors.green),
                      ],
                      if (user['role'] == 'faculty') ...[
                        _buildStatCard(
                          'Pending Registrations', 
                          '0', 
                          Icons.pending_actions, 
                          Colors.orange,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegistrationApprovalsScreen())),
                        ),
                        _buildStatCard(
                          'Active Courses', 
                          '97', 
                          Icons.book, 
                          Colors.blue,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CourseManagementScreen())),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  '${user['role'].toString().substring(0, 1).toUpperCase()}${user['role'].toString().substring(1)} Modules',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
              ],

              // Role-based Modules
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: [
                  // Everyone sees Calendar, Notices, Faculty
                  _buildModuleCard(
                    context, 
                    'Academic Calendar', 
                    Icons.calendar_month, 
                    Colors.indigo,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const AcademicCalendarScreen()),
                    ),
                  ),
                  _buildModuleCard(
                    context, 
                    'Notice Board', 
                    Icons.campaign, 
                    Colors.blue,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NoticeBoardScreen()),
                    ),
                  ),
                  _buildModuleCard(
                    context, 
                    'Faculty Directory', 
                    Icons.people, 
                    Colors.purple,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const FacultyDirectoryScreen()),
                    ),
                  ),

                  // Student specific modules
                  if (user['role'] == 'student') ...[
                    _buildModuleCard(
                      context, 
                      'Weekly Routine', 
                      Icons.calendar_month, 
                      Colors.blue,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WeeklyRoutineScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'My Courses', 
                      Icons.menu_book, 
                      Colors.purple,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyCoursesScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Course Registration', 
                      Icons.app_registration, 
                      Colors.indigo,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const StudentRegistrationScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Attendance Record', 
                      Icons.co_present, 
                      Colors.teal,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AttendanceRecordScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Marks & Grades', 
                      Icons.grade, 
                      Colors.amber,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MyResultsScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Fees & Payment', 
                      Icons.account_balance_wallet, 
                      Colors.teal,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FeePaymentScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Hall Application', 
                      Icons.apartment, 
                      Colors.orange,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentHallScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Clearance Status', 
                      Icons.verified, 
                      Colors.green,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ClearanceStatusScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Medical Center', 
                      Icons.medical_services, 
                      Colors.red,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MedicalCenterScreen())),
                    ),
                  ],

                  // Admin specific modules
                  if (user['role'] == 'admin') ...[
                    _buildModuleCard(
                      context, 
                      'Course Management', 
                      Icons.book, 
                      Colors.teal,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CourseManagementScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Course Assignments', 
                      Icons.layers, 
                      Colors.teal,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CourseAssignmentsScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Registration Approvals', 
                      Icons.check_box, 
                      Colors.indigo,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegistrationApprovalsScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Hall Applications', 
                      Icons.business, 
                      Colors.orange,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const HallApplicationsScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Mark Entry', 
                      Icons.workspace_premium, 
                      Colors.amber,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MarkEntryScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Faculty Management', 
                      Icons.manage_accounts, 
                      Colors.indigo,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ManageUsersScreen()),
                      ),
                    ),
                  ],

                  // Faculty specific modules
                  if (user['role'] == 'faculty') ...[
                    _buildModuleCard(
                      context, 
                      'Weekly Routine', 
                      Icons.calendar_month, 
                      Colors.blue,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WeeklyRoutineScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Course Catalog', 
                      Icons.menu_book, 
                      Colors.purple,
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CourseManagementScreen())),
                    ),
                    _buildModuleCard(
                      context, 
                      'Pending Registrations', 
                      Icons.fact_check, 
                      Colors.indigo,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegistrationApprovalsScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Mark Attendance', 
                      Icons.co_present, 
                      Colors.teal,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FacultyAttendanceScreen()),
                      ),
                    ),
                    _buildModuleCard(
                      context, 
                      'Enter Marks & Grades', 
                      Icons.edit_document, 
                      Colors.amber,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MarkEntryScreen()),
                      ),
                    ),
                  ],

                  // Common Settings
                  _buildModuleCard(
                    context, 
                    'My Profile', 
                    Icons.person, 
                    Colors.grey,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const MyProfileScreen()),
                    ),
                  ),
                ],
              ),
            ],
          ),
    );
  }

  Widget _buildModuleCard(BuildContext context, String title, IconData icon, Color color, {VoidCallback? onTap}) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: onTap ?? () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$title module coming soon!')),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 32, color: color),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, {VoidCallback? onTap}) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B), // Match web's dark cards
        borderRadius: BorderRadius.circular(16),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Icon(icon, color: color, size: 28),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade400,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
