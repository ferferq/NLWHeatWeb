import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface UserProps {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface AuthContextProps {
  user: UserProps | null;
  signInUrl: string;
  signOut: () => void;
}

interface AuthResponseProps {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=4050e5548ef9cbcd98c5`

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponseProps>('authenticate', {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');
    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=');

      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');

    if (token && !user) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<UserProps>('profile').then(response => {
        setUser(response.data);
      })
    }
  })

  async function signOut() {
    await localStorage.removeItem('@dowhile:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signInUrl, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const {user, signInUrl, signOut} = useContext(AuthContext);

  return {user, signInUrl, signOut}
}