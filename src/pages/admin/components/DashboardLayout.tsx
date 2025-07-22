import React, { ReactNode, useState } from 'react';
import { Menu, X, Bell, User, Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarLinks = [
  { label: 'Overview', icon: <Menu className="w-5 h-5" />, key: 'overview' },
  { label: 'Items', icon: <Menu className="w-5 h-5" />, key: 'items' },
  { label: 'Users', icon: <Menu className="w-5 h-5" />, key: 'users' },
  { label: 'Bookings', icon: <Menu className="w-5 h-5" />, key: 'bookings' },
  { label: 'Transactions', icon: <Menu className="w-5 h-5" />, key: 'transactions' },
  { label: 'Categories', icon: <Menu className="w-5 h-5" />, key: 'categories' },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-my-primary" />
          </button>
          <span className="font-bold text-xl text-my-primary">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary outline-none"
            />
            <Search className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-my-primary" />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <div className="flex flex-1">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        <aside className={`fixed z-50 lg:static top-0 left-0 h-full w-64 bg-white shadow-lg border-r transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex items-center justify-between px-6 h-16 border-b">
            <span className="font-bold text-lg text-my-primary">InnovaDash</span>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-4">
            {sidebarLinks.map(link => (
              <a
                key={link.key}
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 hover:bg-my-primary/10 hover:text-my-primary transition-colors font-medium"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 