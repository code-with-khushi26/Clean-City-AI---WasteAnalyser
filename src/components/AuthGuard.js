import { useEffect, useState } from 'react';
import { auth, signInWithGoogle } from '../services/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Trash2, Camera, Map, TrendingUp, Leaf, ArrowRight } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '700ms'}}></div>
          <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding & Info */}
          <div className="text-center md:text-left space-y-6">
            
            {/* Logo & Title */}
            <div className="inline-flex items-center gap-3 bg-white bg-opacity-80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                <Sparkles className="text-white" size={32} />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-800">Clean City AI</h1>
                <p className="text-sm text-green-600 font-medium">Waste Analysis Platform</p>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Smart Waste<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Detection & Analysis
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Help keep your city clean by detecting, classifying, and reporting waste using advanced AI vision technology.
            </p>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              {[
                { icon: Camera, text: 'AI-Powered Waste Classification' },
                { icon: Map, text: 'Real-time Location Tracking' },
                { icon: TrendingUp, text: 'Cleanliness Analytics & Insights' },
                { icon: Leaf, text: 'Environmental Impact Monitoring' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <feature.icon className="text-green-600" size={20} />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6">
            
            {/* Card Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                <Trash2 className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Welcome Back!</h3>
              <p className="text-gray-600">Sign in to continue making an impact</p>
            </div>

            {/* Sign In Button */}
            <button
              onClick={signInWithGoogle}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
              <ArrowRight className={`transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} size={20} />
            </button>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-4">Why trust us?</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">99%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">🔒</div>
                  <div className="text-xs text-gray-600">Secure</div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy. 
              We respect your privacy and data security.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
          <p>© 2024 Clean City AI • Making cities cleaner, one report at a time</p>
        </div>
      </div>
    );
  }

  // Return children only when user is authenticated
  return <>{children}</>;
};

export default AuthGuard;