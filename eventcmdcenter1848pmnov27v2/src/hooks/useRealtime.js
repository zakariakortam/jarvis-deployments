import { useEffect, useCallback } from 'react';
import realtimeService from '../services/realtimeDataService';
import useEventStore from '../store/eventStore';

const useRealtime = () => {
  const {
    updateAttendeeFlow,
    updateTicketScans,
    updateVendorSales,
    updateSecurity,
    updateStaffAllocation,
    updateCrowdDensity,
    updateStats,
    addAlert,
    updateConnectionStatus,
    settings
  } = useEventStore();

  // Subscribe to data updates
  useEffect(() => {
    // Set update frequency from settings
    if (settings.dataUpdateInterval) {
      realtimeService.setUpdateFrequency(settings.dataUpdateInterval);
    }

    // Subscribe to all channels
    const unsubscribers = [
      realtimeService.subscribe('attendeeFlow', updateAttendeeFlow),
      realtimeService.subscribe('ticketScans', updateTicketScans),
      realtimeService.subscribe('vendorSales', updateVendorSales),
      realtimeService.subscribe('security', updateSecurity),
      realtimeService.subscribe('staffAllocation', updateStaffAllocation),
      realtimeService.subscribe('crowdDensity', updateCrowdDensity),
      realtimeService.subscribe('stats', updateStats),
      realtimeService.subscribe('alerts', (alert) => {
        if (alert) {
          addAlert(alert);
          // Optional: Play sound or show notification
          if (settings.notificationsEnabled) {
            showNotification(alert);
          }
        }
      })
    ];

    // Start the realtime service
    realtimeService.start();

    // Update connection status periodically
    const statusInterval = setInterval(() => {
      const status = realtimeService.getConnectionStatus();
      updateConnectionStatus(status);
    }, 5000);

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      realtimeService.stop();
      clearInterval(statusInterval);
    };
  }, [
    updateAttendeeFlow,
    updateTicketScans,
    updateVendorSales,
    updateSecurity,
    updateStaffAllocation,
    updateCrowdDensity,
    updateStats,
    addAlert,
    updateConnectionStatus,
    settings
  ]);

  const showNotification = useCallback((alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Event Alert', {
        body: alert.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      });
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const refreshData = useCallback((channel) => {
    return realtimeService.triggerUpdate(channel);
  }, []);

  const getServiceStatus = useCallback(() => {
    return realtimeService.getStatus();
  }, []);

  return {
    refreshData,
    getServiceStatus
  };
};

export default useRealtime;
