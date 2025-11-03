import { useState, useEffect } from 'react'
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react'
import axios from 'axios'

const UserManagement = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const roleColors = {
    operator: 'badge-info',
    process_engineer: 'badge-warning',
    quality_engineer: 'badge-success',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users and their permissions
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${roleColors[user.role]}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-steel-700 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-600" size={20} />
            <h2 className="text-lg font-semibold">Role Permissions</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Operator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Can view dashboard, real-time monitoring, and add heat data
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Process Engineer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All Operator permissions plus control charts, process capability analysis, heat history, and report generation
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Quality Engineer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All permissions including data import, settings management, and user management
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
