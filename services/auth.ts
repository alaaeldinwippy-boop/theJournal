import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'ptj_users';
const SESSION_KEY = 'ptj_session';

interface StoredUser extends User {
  passwordHash: string; // Storing plain text for this demo, usually hashed
}

export const register = (email: string, password: string, name: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.find(u => u.email === email)) {
        reject(new Error('Email already registered'));
        return;
      }

      const newUser: StoredUser = {
        id: uuidv4(),
        email,
        name,
        passwordHash: password // Simulation
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Auto login (defaults to persistent for registration)
      const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 500);
  });
};

export const login = (email: string, password: string, remember: boolean = true): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => u.email === email && u.passwordHash === password);
      
      if (user) {
        const sessionUser = { id: user.id, email: user.email, name: user.name };
        
        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        }
        
        resolve(sessionUser);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
  const localSession = localStorage.getItem(SESSION_KEY);
  const sessionSession = sessionStorage.getItem(SESSION_KEY);
  const sessionStr = localSession || sessionSession;
  
  return sessionStr ? JSON.parse(sessionStr) : null;
};