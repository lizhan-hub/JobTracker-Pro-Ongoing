import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/Auth';

// 使用相对路径，通过Vite代理访问后端
const API_BASE_URL = '/api';

class AuthService {
  private token: string | null = localStorage.getItem('token');
  private user: User | null = this.token ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const data: AuthResponse = await response.json();
    this.setAuthData(data);
    return data;
  }

  async register(credentials: RegisterRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('注册失败');
    }

    return await response.text();
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private setAuthData(authResponse: AuthResponse): void {
    this.token = authResponse.token;
    this.user = {
      id: authResponse.id,
      email: authResponse.email,
      role: authResponse.roles[0] || 'USER',
    };
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authService = new AuthService();
