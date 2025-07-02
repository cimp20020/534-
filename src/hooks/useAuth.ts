import { useState, useEffect } from 'react';
import { authService, AdminSession } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const session = authService.getCurrentSession();
    setUser(session);
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(username, password);
      
      if (result.success && result.session) {
        setUser(result.session);
        return { data: result.session, error: null };
      } else {
        return { data: null, error: { message: result.error || 'Authentication failed' } };
      }
    } catch (error) {
      return { data: null, error: { message: 'Authentication failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    return { error: null };
  };

  return {
    user,
    adminUser: user, // For compatibility with existing code
    loading,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin' && user?.isAuthenticated,
  };
};