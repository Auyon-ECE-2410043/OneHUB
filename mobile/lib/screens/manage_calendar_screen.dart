import "package:flutter/material.dart";
import "../services/api_service.dart";
import "../services/calendar_service.dart";

class ManageCalendarScreen extends StatefulWidget {
  const ManageCalendarScreen({super.key});
  @override
  State<ManageCalendarScreen> createState() => _ManageCalendarScreenState();
}

class _ManageCalendarScreenState extends State<ManageCalendarScreen> {
  final ApiService _api = ApiService();
  final CalendarService _calendar = CalendarService();
  bool _isLoading = true;
  List<dynamic> _holidays = [];

  @override
  void initState() {
    super.initState();
    _fetchHolidays();
  }

  Future<void> _fetchHolidays() async {
    setState(() => _isLoading = true);
    try {
      final res = await _calendar.getHolidays();
      setState(() => _holidays = res);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to load: $e")));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showModal([Map<String, dynamic>? holiday]) {
    final titleController = TextEditingController(text: holiday?["title"] ?? "");
    String type = holiday?["type"] ?? "holiday";
    bool classesSuspended = holiday?["classesSuspended"] ?? true;
    
    DateTime? startDate = holiday != null ? DateTime.parse(holiday["startDate"]) : null;
    DateTime? endDate = holiday != null ? DateTime.parse(holiday["endDate"]) : null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(holiday == null ? "Add Event" : "Edit Event", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextField(controller: titleController, decoration: const InputDecoration(labelText: "Event Title")),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: const InputDecoration(labelText: "Type"),
                  items: const [
                    DropdownMenuItem(value: "holiday", child: Text("Holiday")),
                    DropdownMenuItem(value: "vacation", child: Text("Vacation")),
                    DropdownMenuItem(value: "event", child: Text("Event"))
                  ],
                  onChanged: (v) => setModalState(() => type = v!),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text("Classes Suspended?"),
                  value: classesSuspended,
                  onChanged: (v) => setModalState(() => classesSuspended = v),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.date_range),
                        label: Text(startDate != null ? "${startDate!.toLocal()}".split(" ")[0] : "Start Date"),
                        onPressed: () async {
                          final d = await showDatePicker(context: context, initialDate: startDate ?? DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
                          if (d != null) setModalState(() => startDate = d);
                        }
                      )
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.date_range),
                        label: Text(endDate != null ? "${endDate!.toLocal()}".split(" ")[0] : "End Date"),
                        onPressed: () async {
                          final d = await showDatePicker(context: context, initialDate: endDate ?? startDate ?? DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime(2030));
                          if (d != null) setModalState(() => endDate = d);
                        }
                      )
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.isEmpty || startDate == null || endDate == null) return;
                    try {
                      final body = {
                        "title": titleController.text,
                        "startDate": startDate!.toIso8601String(),
                        "endDate": endDate!.toIso8601String(),
                        "type": type,
                        "classesSuspended": classesSuspended
                      };
                      if (holiday == null) {
                        await _api.post("/calendar/holidays", body: body);
                      } else {
                        await _api.put("/calendar/holidays/${holiday['_id']}", body: body);
                      }
                      if (context.mounted) Navigator.pop(context);
                      _fetchHolidays();
                    } catch (e) {
                      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
                    }
                  },
                  child: const Text("Save"),
                ),
                const SizedBox(height: 24),
              ]
            )
          )
        )
      )
    );
  }

  Future<void> _deleteHoliday(String id) async {
    try {
      await _api.delete("/calendar/holidays/$id");
      _fetchHolidays();
    } catch(e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to delete")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Manage Calendar")),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showModal(),
        child: const Icon(Icons.add),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            itemCount: _holidays.length,
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, i) {
              final h = _holidays[i];
              return Card(
                child: ListTile(
                  title: Text(h["title"]),
                  subtitle: Text("${h['startDate'].split('T')[0]} - ${h['endDate'].split('T')[0]}\n${h['type']} | Classes Suspended: ${h['classesSuspended']}"),
                  isThreeLine: true,
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => _showModal(h)),
                      IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _deleteHoliday(h["_id"])),
                    ]
                  )
                )
              );
            }
          )
    );
  }
}
