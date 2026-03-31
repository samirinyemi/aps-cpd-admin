const variants = {
  Pending: 'bg-status-pending-bg text-status-pending',
  Open: 'bg-status-open-bg text-status-open',
  Closed: 'bg-status-closed-bg text-status-closed',
  Active: 'bg-status-open-bg text-status-open',
  Inactive: 'bg-status-pending-bg text-status-pending',
  Success: 'bg-status-success-bg text-status-success',
  Partial: 'bg-status-partial-bg text-status-partial',
  Failure: 'bg-status-failure-bg text-status-failure',
  Yes: 'bg-status-open-bg text-status-open',
  No: 'bg-status-closed-bg text-status-closed',
};

export default function StatusBadge({ status }) {
  const classes = variants[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}
