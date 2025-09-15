import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const stored = localStorage.getItem('pendingActions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingAction = (action) => {
    const newActions = [...pendingActions, {
      ...action,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }];
    setPendingActions(newActions);
    localStorage.setItem('pendingActions', JSON.stringify(newActions));
  };

  const removePendingAction = (actionId) => {
    const newActions = pendingActions.filter(action => action.id !== actionId);
    setPendingActions(newActions);
    localStorage.setItem('pendingActions', JSON.stringify(newActions));
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const { default: api } = await import('../services/api');

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'CREATE_ISSUE':
            await api.post('/issues', action.data);
            break;
          case 'UPDATE_ISSUE':
            await api.put(`/issues/${action.data.id}`, action.data);
            break;
          case 'COMPLETE_MAINTENANCE':
            await api.post(`/maintenance/${action.data.taskId}/complete`, action.data);
            break;
          case 'UPDATE_MAINTENANCE':
            await api.put(`/maintenance/${action.data.id}`, action.data);
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
        removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Keep the action for retry
      }
    }
  };

  const value = {
    isOnline,
    pendingActions,
    addPendingAction,
    removePendingAction,
    syncPendingActions
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};