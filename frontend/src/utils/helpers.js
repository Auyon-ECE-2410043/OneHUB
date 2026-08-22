export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "৳ 0";
  return `৳ ${Number(amount).toLocaleString("en-BD")}`;
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case "approved":
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending_approval":
    case "pending_review":
    case "due":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "flagged_ineligible":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export function getStatusLabel(status) {
  if (!status) return "Unknown";
  switch (status) {
    case "pending_approval":
      return "Pending Approval";
    case "pending_review":
      return "Pending Review";
    case "flagged_ineligible":
      return "Flagged / Verification Needed";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "paid":
      return "Paid";
    case "due":
      return "Payment Due";
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
