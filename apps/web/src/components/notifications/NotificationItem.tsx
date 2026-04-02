import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { getNotificationText } from '@/lib/notification-text';
import type { Notification } from '@/lib/types/notification.types';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps): React.JSX.Element {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 border-b border-tertiary-100 p-4 text-left transition-colors last:border-0 hover:bg-tertiary-100"
      onClick={() => onClick(notification)}
    >
      {/* Unread dot */}
      {!notification.isRead ? (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" />
      ) : (
        <span className="h-2 w-2 shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1">
        <p
          className={`text-sm text-secondary-600 ${
            !notification.isRead ? 'font-medium' : 'font-normal'
          }`}
        >
          {getNotificationText(notification)}
        </p>
        <p className="mt-1 text-xs text-tertiary-400">
          {format(new Date(notification.createdAt), 'dd.MM. HH:mm')}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-tertiary-300" />
    </button>
  );
}
