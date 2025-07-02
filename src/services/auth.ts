export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  username: string;
  role: 'admin';
  isAuthenticated: boolean;
}

export class AuthService {
  private readonly STORAGE_KEY = 'admin_session';
  private readonly DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin'
  };

  // Get current session from localStorage
  getCurrentSession(): AdminSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Validate session structure
        if (session.username && session.role && session.isAuthenticated) {
          return session;
        }
      }
    } catch (error) {
      console.error('Error reading session:', error);
    }
    return null;
  }

  // Authenticate user with username/password
  async signIn(username: string, password: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
    try {
      // Check against default admin credentials
      if (username === this.DEFAULT_ADMIN.username && password === this.DEFAULT_ADMIN.password) {
        const session: AdminSession = {
          username: username,
          role: 'admin',
          isAuthenticated: true
        };

        // Store session in localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        
        return { success: true, session };
      }

      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    return session?.isAuthenticated === true;
  }

  // Get current user info
  getCurrentUser(): AdminSession | null {
    return this.getCurrentSession();
  }

  // Simple login method for compatibility
  async login(username: string, password: string): Promise<boolean> {
    const result = await this.signIn(username, password);
    if (result.success) {
      localStorage.setItem('admin_token', 'authenticated');
      return true;
    }
    return false;
  }

  // Simple logout method for compatibility
  logout(): void {
    localStorage.removeItem('admin_token');
    this.signOut();
  }
}

export const authService = new AuthService();