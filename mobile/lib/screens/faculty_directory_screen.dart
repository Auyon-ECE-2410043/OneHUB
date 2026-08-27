import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/user_service.dart';

class FacultyDirectoryScreen extends StatefulWidget {
  const FacultyDirectoryScreen({super.key});

  @override
  State<FacultyDirectoryScreen> createState() => _FacultyDirectoryScreenState();
}

class _FacultyDirectoryScreenState extends State<FacultyDirectoryScreen> {
  final UserService _userService = UserService();
  List<dynamic> _faculty = [];
  bool _isLoading = true;

  String _searchQuery = '';
  String _selectedDept = 'All';

  final List<String> _departments = [
    'All', 'ECE', 'CSE', 'EEE', 'ETE', 'ME', 'IPE', 'GCE', 'MTE',
    'CE', 'URP', 'Arch', 'CFPE', 'MSE', 'BECM', 'Physics', 'Chemistry', 'Math', 'Humanities', 'CME', 'ChE'
  ];

  @override
  void initState() {
    super.initState();
    _fetchFaculty();
  }

  Future<void> _fetchFaculty() async {
    try {
      final facultyList = await _userService.getFaculty();
      if (mounted) {
        setState(() {
          _faculty = facultyList;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load faculty: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showProfileModal(Map<String, dynamic> person) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Area
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.indigo.shade100,
                          backgroundImage: person['photoUrl'] != null ? NetworkImage(person['photoUrl']) : null,
                          child: person['photoUrl'] == null
                              ? Text(
                                  person['name'].toString().substring(0, 1).toUpperCase(),
                                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.indigo.shade800),
                                )
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                person['name'] ?? '',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, height: 1.2),
                              ),
                              if (person['nameBengali'] != null && person['nameBengali'].toString().isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    person['nameBengali'],
                                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                                  ),
                                ),
                              const SizedBox(height: 6),
                              Text(
                                '${person['designation']} • ${person['department']}',
                                style: TextStyle(fontSize: 15, color: Colors.indigo.shade700, fontWeight: FontWeight.w600),
                              ),
                              if (person['isHeadOfDept'] == true)
                                Container(
                                  margin: const EdgeInsets.only(top: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade50,
                                    border: Border.all(color: Colors.red.shade200),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text('Head of Department', style: TextStyle(color: Colors.red.shade700, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Contact Info
                    const Text('Contact Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (person['email'] != null && person['email'].toString().isNotEmpty) ...[
                      Row(
                        children: [
                          const Icon(Icons.email, size: 20, color: Colors.grey),
                          const SizedBox(width: 12),
                          Expanded(child: Text(person['email'], style: const TextStyle(fontSize: 15))),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (person['phone'] != null && person['phone'].toString().isNotEmpty) ...[
                      Row(
                        children: [
                          const Icon(Icons.phone, size: 20, color: Colors.grey),
                          const SizedBox(width: 12),
                          Expanded(child: Text(person['phone'], style: const TextStyle(fontSize: 15))),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (person['officeLocation'] != null && person['officeLocation'].toString().isNotEmpty) ...[
                      Row(
                        children: [
                          const Icon(Icons.business, size: 20, color: Colors.grey),
                          const SizedBox(width: 12),
                          Expanded(child: Text(person['officeLocation'], style: const TextStyle(fontSize: 15))),
                        ],
                      ),
                    ],

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Field of Research
                    if (person['fieldOfResearch'] != null && (person['fieldOfResearch'] as List).isNotEmpty) ...[
                      const Text('Field of Research', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: (person['fieldOfResearch'] as List).map<Widget>((r) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.blue.shade100)
                          ),
                          child: Text(r.toString(), style: TextStyle(color: Colors.blue.shade800, fontSize: 13)),
                        )).toList(),
                      ),
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),
                    ],

                    // Education
                    if (person['education'] != null && (person['education'] as List).isNotEmpty) ...[
                      const Text('Education', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      ...(person['education'] as List).map<Widget>((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.school, size: 20, color: Colors.indigo.shade300),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(e['degree'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                  const SizedBox(height: 2),
                                  Text(e['institution'] ?? '', style: TextStyle(color: Colors.grey.shade700, fontSize: 14)),
                                  if (e['year'] != null && e['year'].toString().isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Text(e['year'].toString(), style: TextStyle(color: Colors.indigo.shade600, fontSize: 12, fontWeight: FontWeight.w600)),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                      const Divider(),
                      const SizedBox(height: 16),
                    ],

                    // Position History
                    if (person['positionHistory'] != null && (person['positionHistory'] as List).isNotEmpty) ...[
                      const Text('Experience', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      ...(person['positionHistory'] as List).map<Widget>((p) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.work, size: 20, color: Colors.teal.shade300),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p['role'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                  const SizedBox(height: 2),
                                  Text(p['institution'] ?? '', style: TextStyle(color: Colors.grey.shade700, fontSize: 14)),
                                  if (p['duration'] != null && p['duration'].toString().isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Text(p['duration'].toString(), style: TextStyle(color: Colors.teal.shade600, fontSize: 12, fontWeight: FontWeight.w600)),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],

                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddFacultyModal() {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    final designationController = TextEditingController();
    final departmentController = TextEditingController();
    final passwordController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
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
              const Text(
                'Add Faculty Member',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Email Address'),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                decoration: const InputDecoration(labelText: 'Temporary Password'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: departmentController,
                decoration: const InputDecoration(labelText: 'Department (e.g., CSE)'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: designationController,
                decoration: const InputDecoration(labelText: 'Designation (e.g., Professor)'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number (Optional)'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (nameController.text.isEmpty || emailController.text.isEmpty) return;
                  try {
                    await _userService.createFaculty({
                      'name': nameController.text,
                      'email': emailController.text,
                      'password': passwordController.text,
                      'department': departmentController.text,
                      'designation': designationController.text,
                      'phone': phoneController.text,
                    });
                    if (context.mounted) Navigator.pop(context);
                    _fetchFaculty();
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to add: $e')),
                      );
                    }
                  }
                },
                child: const Text('Add Faculty'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isAdmin = user != null && user['role'] == 'admin';

    // Filter logic
    final filtered = _faculty.where((f) {
      final matchesSearch = (f['name'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            (f['email'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            (f['officeLocation'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesDept = _selectedDept == 'All' || f['department'] == _selectedDept;
      return matchesSearch && matchesDept;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Faculty Directory'),
        elevation: 0,
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton(
              onPressed: _showAddFacultyModal,
              backgroundColor: Theme.of(context).primaryColor,
              child: const Icon(Icons.person_add, color: Colors.white),
            )
          : null,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search & Filter Header
                Container(
                  color: Theme.of(context).primaryColor,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Column(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: TextField(
                          onChanged: (val) => setState(() => _searchQuery = val),
                          decoration: const InputDecoration(
                            hintText: 'Search by name, email, or room...',
                            prefixIcon: Icon(Icons.search, color: Colors.grey),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _departments.map((dept) {
                            final isSelected = _selectedDept == dept;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(dept),
                                selected: isSelected,
                                onSelected: (val) {
                                  if (val) setState(() => _selectedDept = dept);
                                },
                                selectedColor: Colors.white,
                                labelStyle: TextStyle(
                                  color: isSelected ? Theme.of(context).primaryColor : Colors.white,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                                backgroundColor: Colors.white.withValues(alpha: 0.2),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                // List View
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _fetchFaculty,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final person = filtered[index];
                        
                        return InkWell(
                          onTap: () => _showProfileModal(person),
                          borderRadius: BorderRadius.circular(16),
                          child: Card(
                            elevation: 1,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            margin: EdgeInsets.zero,
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 30,
                                    backgroundColor: Colors.indigo.shade100,
                                    backgroundImage: person['photoUrl'] != null 
                                      ? NetworkImage(person['photoUrl']) 
                                      : null,
                                    child: person['photoUrl'] == null 
                                      ? Text(
                                          person['name'].toString().substring(0, 1).toUpperCase(),
                                          style: TextStyle(
                                            fontSize: 24,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.indigo.shade800,
                                          ),
                                        )
                                      : null,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                person['name'] ?? '',
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (person['isPhdHolder'] == true)
                                              Container(
                                                margin: const EdgeInsets.only(left: 4),
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.amber.shade100,
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Text('PhD', style: TextStyle(fontSize: 10, color: Colors.amber.shade900, fontWeight: FontWeight.bold)),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${person['designation']} • ${person['department']}',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: Colors.grey.shade700,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        if (person['officeLocation'] != null && person['officeLocation'].toString().isNotEmpty)
                                          Row(
                                            children: [
                                              Icon(Icons.business, size: 12, color: Colors.grey.shade500),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  person['officeLocation'],
                                                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          )
                                        else
                                          Row(
                                            children: [
                                              Icon(Icons.email, size: 12, color: Colors.grey.shade500),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  person['email'] ?? '',
                                                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.chevron_right, color: Colors.grey),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
