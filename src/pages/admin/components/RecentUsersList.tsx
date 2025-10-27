import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MoreHorizontal, ArrowUpRight } from 'lucide-react';

interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  joinDate: string;
  verified: boolean;
  initials: string;
}

interface RecentUsersListProps {
  recentUsers: RecentUser[];
  Button: React.FC<any>;
}

const RecentUsersList: React.FC<RecentUsersListProps> = ({ recentUsers, Button }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-4">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
      <button 
        onClick={() => {
          // This will be handled by the parent component
          const event = new CustomEvent('navigateToUsersTab');
          window.dispatchEvent(event);
        }}
        className="text-sm text-my-primary hover:text-my-primary/80 font-medium flex items-center group"
      >
        View all
        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
    <div className="space-y-4">
      {recentUsers.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent users found</p>
        </div>
      ) : (
        recentUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-xl object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold text-white bg-my-primary ${user.avatar ? 'hidden' : ''}`}
              >
                {user.initials}
              </div>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs px-2 py-1 bg-my-primary text-white rounded-lg">
                  {user.role}
                </span>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  user.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
            <Button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  </div>
);

export default RecentUsersList; 