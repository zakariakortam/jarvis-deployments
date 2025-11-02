import { NavLink } from 'react-router-dom'

const Sidebar = ({ isOpen, onToggle }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/data-entry', label: 'Data Entry', icon: '✏️' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <aside className={`bg-slate-800 text-white w-64 flex-shrink-0 transition-transform duration-300 ${!isOpen && '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-slate-700'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
