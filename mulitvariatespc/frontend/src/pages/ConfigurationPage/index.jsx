import { useState } from 'react'
import { useSpcStore } from '../../store/spcStore'
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ConfigurationPage() {
  const { config, setConfig } = useSpcStore()
  const [variables, setVariables] = useState(config.variables || [])
  const [newVariable, setNewVariable] = useState({ name: '', unit: '', lsl: '', usl: '' })

  const handleAddVariable = () => {
    if (!newVariable.name) {
      toast.error('Variable name is required')
      return
    }
    setVariables([...variables, { ...newVariable, id: Date.now() }])
    setNewVariable({ name: '', unit: '', lsl: '', usl: '' })
    toast.success('Variable added')
  }

  const handleRemoveVariable = (id) => {
    setVariables(variables.filter(v => v.id !== id))
    toast.success('Variable removed')
  }

  const handleSaveConfiguration = () => {
    setConfig({ ...config, variables })
    toast.success('Configuration saved')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="mt-1 text-muted-foreground">
          Configure process variables and monitoring parameters
        </p>
      </div>

      {/* Process Variables */}
      <div className="stat-card">
        <h3 className="mb-4 text-lg font-semibold">Process Variables</h3>

        {/* Existing Variables */}
        <div className="mb-4 space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted p-3"
            >
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="font-medium">{variable.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Unit</span>
                  <p className="font-medium">{variable.unit || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">LSL</span>
                  <p className="font-medium">{variable.lsl || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">USL</span>
                  <p className="font-medium">{variable.usl || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveVariable(variable.id)}
                className="ml-4 rounded-lg p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Variable */}
        <div className="rounded-lg border border-dashed border-border p-4">
          <h4 className="mb-3 text-sm font-semibold">Add New Variable</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input
              type="text"
              placeholder="Variable Name"
              value={newVariable.name}
              onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Unit"
              value={newVariable.unit}
              onChange={(e) => setNewVariable({ ...newVariable, unit: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="LSL"
              value={newVariable.lsl}
              onChange={(e) => setNewVariable({ ...newVariable, lsl: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="USL"
              value={newVariable.usl}
              onChange={(e) => setNewVariable({ ...newVariable, usl: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddVariable}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monitoring Parameters */}
      <div className="stat-card">
        <h3 className="mb-4 text-lg font-semibold">Monitoring Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Sampling Interval (ms)
            </label>
            <input
              type="number"
              value={config.samplingInterval}
              onChange={(e) => setConfig({ ...config, samplingInterval: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Default Chart Type
            </label>
            <select
              value={config.chartType}
              onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            >
              <option value="hotelling">Hotelling's T²</option>
              <option value="mewma">MEWMA</option>
              <option value="mcusum">MCUSUM</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Contribution Plots</p>
              <p className="text-xs text-muted-foreground">
                Display variable contribution analysis
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.showContributions}
              onChange={(e) => setConfig({ ...config, showContributions: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto Export</p>
              <p className="text-xs text-muted-foreground">
                Automatically export data on alerts
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.autoExport}
              onChange={(e) => setConfig({ ...config, autoExport: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfiguration}
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <CheckIcon className="mr-2 h-4 w-4" />
          Save Configuration
        </button>
      </div>
    </div>
  )
}
