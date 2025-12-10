import { create } from 'zustand';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  patientId?: number;
  doctorId?: number;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, isLoading: false }),
}));

export const initializeAuth = async () => {
  try {
    useAuth.getState().setLoading(true);
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      useAuth.getState().setUser(data.user);
    } else {
      useAuth.getState().setUser(null);
    }
  } catch {
    useAuth.getState().setUser(null);
  } finally {
    useAuth.getState().setLoading(false);
  }
};
