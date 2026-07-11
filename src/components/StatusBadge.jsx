const statusStyles = {
  'Planning': 'bg-slate/10 text-slate',
  'Bidding Open': 'bg-signal-amber/10 text-signal-amber',
  'Booked': 'bg-circuit-teal/10 text-circuit-teal',
  'Pending': 'bg-signal-amber/10 text-signal-amber',
  'Accepted': 'bg-circuit-teal/10 text-circuit-teal',
  'Rejected': 'bg-error/10 text-error',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-slate/10 text-slate';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium ${style}`}>
      {status}
    </span>
  );
}
