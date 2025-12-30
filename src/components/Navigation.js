import React, { useState, useEffect } from 'react';
import { Home, Trash2, Camera, Map, History } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../services/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

const Navigation = ({ currentPage, onNavigate }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'classifier', icon: Trash2, label: 'Waste Classifier' },
    { id: 'street', icon: Camera, label: 'Litter Detection' },
    { id: 'heatmap', icon: Map, label: 'Dirty Zones' },
    { id: 'history', icon: History, label: 'Reports' }
  ];

  return (
    <nav className="bg-gradient-to-r from-[#32a873] to-[#32a87b] rounded-2xl shadow-lg mb-6 px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-white rounded-full p-2">
            <Trash2 className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">
            Smart Waste Analyzer
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-green-800 shadow-lg'
                    : 'text-white hover:bg-green-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auth Section */}
        <div className="ml-auto">
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="bg-white text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-all"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-white font-medium hidden md:inline">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;