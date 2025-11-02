import { useState } from 'react'
import { Save, Bell, Database, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({
    alertsEnabled: true,
    emailNotifications: false,
    autoBackup: true,
    dataRetentionDays: 365,
    refreshInterval: 30,
  })

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system preferences and parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bell className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold">Alert Settings</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive alerts for out-of-control conditions
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.alertsEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, alertsEnabled: e.target.checked })
                }
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send email alerts to engineers
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-5 h-5"
              />
            </div>

            <div>
              <label className="label">Refresh Interval (seconds)</label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) =>
                  setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })
                }
                className="input"
                min="5"
                max="300"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Database className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Backup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically backup data daily
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) =>
                  setSettings({ ...settings, autoBackup: e.target.checked })
                }
                className="w-5 h-5"
              />
            </div>

            <div>
              <label className="label">Data Retention (days)</label>
              <input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })
                }
                className="input"
                min="30"
                max="3650"
              />
              <p className="text-xs text-gray-500 mt-1">
                Data older than this will be archived
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-secondary">Reset to Defaults</button>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={20} />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
