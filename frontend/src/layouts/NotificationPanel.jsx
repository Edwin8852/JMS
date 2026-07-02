import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead } from '../store/slices/notificationSlice';
import { Bell, Check, Clock, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.notifications);

  const getIcon = (type) => {
    switch (type) {
      case 'PAYMENT': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'LOAN': return <Info className="text-blue-500" size={18} />;
      case 'ALERT': return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Bell className="text-gray-400" size={18} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 mt-3 w-96 bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl border border-gray-100 dark:border-dark-border p-4 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-black tracking-tight">Notifications</h3>
        <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold">
          {items.filter(n => !n.isRead).length} New
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">All caught up!</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {items.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => !notification.isRead && dispatch(markAsRead(notification.id))}
              className={`p-4 rounded-2xl transition-all cursor-pointer group relative ${
                notification.isRead 
                  ? 'bg-transparent opacity-60 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-dark-card' 
                  : 'bg-gold/5 border border-gold/10 hover:bg-gold/10 shadow-sm'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.isRead ? 'bg-gray-100 dark:bg-dark-border' : 'bg-gold/20'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-gold-gradient rounded-full shadow-sm" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> 
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <button className="w-full mt-4 py-3 text-xs font-black text-gold hover:bg-gold/5 rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-gold/20">
          View All Notifications
        </button>
      )}
    </motion.div>
  );
};

export default NotificationPanel;
