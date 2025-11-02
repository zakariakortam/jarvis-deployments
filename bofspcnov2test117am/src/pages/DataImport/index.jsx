import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'
import { validateCSVData } from '../../utils/dataValidation'
import toast from 'react-hot-toast'
import axios from 'axios'

const DataImport = () => {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [validation, setValidation] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setParsedData(results.data)
        const validationResult = validateCSVData(results.data)
        setValidation(validationResult)

        if (validationResult.valid) {
          toast.success(`CSV parsed successfully: ${validationResult.validRows} valid rows`)
        } else {
          toast.error(`CSV validation failed: ${validationResult.rowErrors?.length || 0} errors`)
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
      },
    })
  }

  const handleImport = async () => {
    if (!parsedData || !validation?.valid) {
      toast.error('Cannot import invalid data')
      return
    }

    setImporting(true)
    try {
      for (const row of parsedData) {
        await axios.post('http://localhost:5000/api/heats', row)
      }
      toast.success(`Successfully imported ${parsedData.length} heats`)
      setFile(null)
      setParsedData(null)
      setValidation(null)
    } catch (error) {
      toast.error('Error importing data')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `heatNumber,timestamp,temperature,carbonContent,oxygenLevel,slagBasicity,phosphorus,sulfur,manganese,blowTime,oxygenFlow,slagWeight
BOF-000001,2025-01-01T10:00:00Z,1650,0.08,99.5,3.2,0.015,0.010,0.80,18,450,5000
BOF-000002,2025-01-01T10:30:00Z,1655,0.09,99.4,3.3,0.016,0.011,0.82,19,455,5100`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bof_data_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Import</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Import heat data from CSV files or external systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">CSV Import</h2>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-steel-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium mb-2">Upload CSV File</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                Select File
              </label>
            </div>

            {file && (
              <div className="alert-info">
                <FileText size={20} />
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            {validation && (
              <div className={validation.valid ? 'alert-success' : 'alert-danger'}>
                {validation.valid ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <div>
                  <p className="font-semibold">
                    {validation.valid ? 'Validation Passed' : 'Validation Failed'}
                  </p>
                  <p className="text-sm">
                    {validation.valid
                      ? `${validation.validRows} valid rows ready to import`
                      : `${validation.rowErrors?.length || 0} errors found`}
                  </p>
                </div>
              </div>
            )}

            {validation?.valid && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-success w-full"
              >
                {importing ? 'Importing...' : `Import ${parsedData.length} Records`}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Download Template</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Download a CSV template with the correct format and sample data.
            </p>

            <button
              onClick={downloadTemplate}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download CSV Template
            </button>

            <div className="border-t border-gray-200 dark:border-steel-700 pt-4">
              <h3 className="font-semibold mb-2">Required Fields:</h3>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• heatNumber</li>
                <li>• timestamp</li>
                <li>• temperature</li>
                <li>• carbonContent</li>
                <li>• oxygenLevel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Integration Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-steel-700 rounded-lg">
            <h3 className="font-semibold mb-2">PLC Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect to Programmable Logic Controllers for real-time data
            </p>
            <button className="btn-secondary w-full">Configure</button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-steel-700 rounded-lg">
            <h3 className="font-semibold mb-2">SCADA Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect to SCADA systems for process monitoring
            </p>
            <button className="btn-secondary w-full">Configure</button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-steel-700 rounded-lg">
            <h3 className="font-semibold mb-2">MES Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect to Manufacturing Execution Systems
            </p>
            <button className="btn-secondary w-full">Configure</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataImport
