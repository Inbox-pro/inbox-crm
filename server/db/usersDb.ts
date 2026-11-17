import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Sales' | 'Viewer';

export interface UserRecord {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<UserRecord, 'passwordHash'>;

const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const INITIAL_ACCOUNTS: Array<{
  id: string;
  name: string;
  email: string;
  role: Role;
  rawPassword: string;
  department: string;
  phone: string;
  avatarUrl: string;
}> = [
  {
    id: 'usr_1',
    name: 'Tejas Chauhan',
    email: 'admin@inboxinfotech.com',
    role: 'Super Admin',
    rawPassword: 'admin@inbox2025',
    department: 'Executive Management',
    phone: '+91 98201 44521',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_2',
    name: 'Ananya Sharma',
    email: 'ananya@inboxinfotech.com',
    role: 'Admin',
    rawPassword: 'admin@inbox2025',
    department: 'Sales Operations',
    phone: '+91 98450 11234',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_3',
    name: 'Vikramaditya Rao',
    email: 'manager@inboxinfotech.com',
    role: 'Manager',
    rawPassword: 'manager@inbox2025',
    department: 'Enterprise Sales',
    phone: '+91 98110 33490',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_4',
    name: 'Rohan Mehta',
    email: 'sales@inboxinfotech.com',
    role: 'Sales',
    rawPassword: 'sales@inbox2025',
    department: 'Direct Sales',
    phone: '+91 98223 99812',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_5',
    name: 'Pooja Iyer',
    email: 'pooja@inboxinfotech.com',
    role: 'Sales',
    rawPassword: 'sales@inbox2025',
    department: 'Mid-Market Sales',
    phone: '+91 97401 55621',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

class UsersDatabase {
  private users: UserRecord[] = [];

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        this.users = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed reading users.json, re-seeding...', err);
      }
    }

    // Seed users with bcrypt hashes
    const now = new Date().toISOString();
    this.users = INITIAL_ACCOUNTS.map((acc) => ({
      id: acc.id,
      organizationId: 'org_inbox_01',
      name: acc.name,
      email: acc.email.toLowerCase(),
      role: acc.role,
      passwordHash: bcrypt.hashSync(acc.rawPassword, 10),
      department: acc.department,
      phone: acc.phone,
      avatarUrl: acc.avatarUrl,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    }));

    this.save();
  }

  private save() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
  }

  public toSafeUser(user: UserRecord): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  public findByEmail(email: string): UserRecord | undefined {
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === clean);
  }

  public findById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  public create(
    data: Omit<UserRecord, 'createdAt' | 'updatedAt' | 'passwordHash' | 'status'> & {
      id?: string;
      password: string;
      status?: 'Active' | 'Inactive';
    }
  ): UserRecord {
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: data.id || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      organizationId: data.organizationId || 'org_inbox_01',
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role || 'Sales',
      passwordHash: bcrypt.hashSync(data.password, 10),
      department: data.department || 'Sales',
      phone: data.phone || '',
      avatarUrl:
        data.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: data.status || 'Active',
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(newUser);
    this.save();
    return newUser;
  }

  public update(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.users[index];
  }

  public list(organizationId?: string): SafeUser[] {
    const filtered = organizationId
      ? this.users.filter((u) => u.organizationId === organizationId)
      : this.users;
    return filtered.map((u) => this.toSafeUser(u));
  }
}

export const usersDb = new UsersDatabase();
