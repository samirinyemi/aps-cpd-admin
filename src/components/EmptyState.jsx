import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No records found.', actionLabel, onAction }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-gray-400 mb-3 flex justify-center">
        <Inbox className="h-12 w-12" strokeWidth={1} />
      </div>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
