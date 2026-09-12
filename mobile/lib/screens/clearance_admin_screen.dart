import "package:flutter/material.dart";
import "dart:convert";
import "package:shared_preferences/shared_preferences.dart";
import "../services/api_service.dart";

class ClearanceAdminScreen extends StatefulWidget {
  const ClearanceAdminScreen({super.key});

  @override
  State<ClearanceAdminScreen> createState() => _ClearanceAdminScreenState();
}

class _ClearanceAdminScreenState extends State<ClearanceAdminScreen> with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  String _activeTab = "departmental";
  List<dynamic> _clearances = [];
  String _search = "";

  late TabController _tabController;
  final List<Map<String, dynamic>> _departments = [
    {"id": "departmental", "label": "Department", "icon": Icons.school},
    {"id": "hall", "label": "Hall Office", "icon": Icons.apartment},
    {"id": "library", "label": "Library", "icon": Icons.local_library},
    {"id": "accounts", "label": "Accounts", "icon": Icons.account_balance_wallet},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _departments.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _activeTab = _departments[_tabController.index]["id"]);
        _fetchClearances();
      }
    });
    _initRole();
  }

  Future<void> _initRole() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString("user");
    if (userStr != null) {
      final userObj = jsonDecode(userStr);
      if (userObj["role"] == "hall_admin") {
        setState(() => _activeTab = "hall");
        _tabController.index = 1;
      }
    }
    _fetchClearances();
  }

  Future<void> _fetchClearances() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get("/clearance/pending/\$_activeTab");
      setState(() => _clearances = res["clearances"] ?? []);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to load: \$e")));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _approveClearance(String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Approve Clearance"),
        content: Text("Are you sure you want to approve clearance for \$name?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text("Approve")),
        ]
      )
    );

    if (confirm != true) return;

    try {
      await _api.put("/clearance/\$id/\$_activeTab/approve", body: {"remarks": "Approved via Mobile App"});
      setState(() => _clearances.removeWhere((c) => c["_id"] == id));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Approved \$name")));
    } catch(e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed: \$e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _clearances.where((c) {
      final name = c["studentId"]?["name"]?.toString().toLowerCase() ?? "";
      final roll = c["studentId"]?["rollNo"]?.toString() ?? "";
      return name.contains(_search.toLowerCase()) || roll.contains(_search);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Manage Clearances"),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _departments.map((d) => Tab(icon: Icon(d["icon"]), text: d["label"])).toList(),
        )
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: const InputDecoration(
                labelText: "Search by name or roll...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)))
              ),
              onChanged: (v) => setState(() => _search = v),
            ),
          ),
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                ? const Center(child: Text("No pending clearances found."))
                : ListView.builder(
                    itemCount: filtered.length,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemBuilder: (context, i) {
                      final c = filtered[i];
                      final student = c["studentId"] ?? {};
                      return Card(
                        child: ListTile(
                          title: Text(student["name"] ?? "Unknown Student"),
                          subtitle: Text("Roll: \${student["rollNo"] ?? "N/A"} | Dept: \${student["department"] ?? "N/A"}"),
                          trailing: ElevatedButton.icon(
                            icon: const Icon(Icons.check_circle, size: 18),
                            label: const Text("Approve"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                            onPressed: () => _approveClearance(c["_id"], student["name"] ?? "Student"),
                          )
                        )
                      );
                    }
                  )
          )
        ]
      )
    );
  }
}
