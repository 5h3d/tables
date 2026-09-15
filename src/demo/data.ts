export type UserRole = 'Admin' | 'Editor' | 'Viewer' | 'Billing'
export type UserStatus = 'active' | 'pending' | 'suspended'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  /** ISO date */
  createdAt: string
}

// The ten people from the design frames, in design order.
const seed: Array<[string, string, UserRole, UserStatus, string]> = [
  ['Amara Okafor', 'amara.okafor@northwind.io', 'Admin', 'active', '2026-03-04'],
  ['Ben Castellano', 'ben.c@northwind.io', 'Editor', 'active', '2026-01-19'],
  ['Chloe Nguyen', 'chloe.nguyen@northwind.io', 'Viewer', 'pending', '2026-08-27'],
  ['Daniel Reyes', 'd.reyes@northwind.io', 'Editor', 'suspended', '2025-11-02'],
  ['Elif Kaya', 'elif.kaya@northwind.io', 'Admin', 'active', '2025-09-15'],
  ['Femi Adeyemi', 'femi@northwind.io', 'Viewer', 'active', '2026-05-30'],
  ['Greta Lindqvist', 'greta.l@northwind.io', 'Billing', 'pending', '2026-09-02'],
  ['Hiro Tanaka', 'hiro.tanaka@northwind.io', 'Editor', 'active', '2026-02-11'],
  ['Isabel Moreau', 'isabel.m@northwind.io', 'Viewer', 'suspended', '2025-12-20'],
  ['Jonas Weber', 'jonas.weber@northwind.io', 'Admin', 'active', '2026-07-08'],
]

// First names start after the seed users alphabetically so the design's ten
// users lead the list when sorted by name.
const firstNames = ['Kai', 'Lena', 'Mateo', 'Nadia', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sven', 'Tara', 'Umar', 'Vera', 'Wren', 'Xavier', 'Yara', 'Zane', 'Kofi', 'Luca', 'Mira', 'Nico', 'Ola', 'Pia', 'Rafael', 'Sana', 'Theo', 'Uma', 'Viktor', 'Willa', 'Yusuf', 'Zara', 'Leo', 'Maya', 'Noor', 'Otto']
const lastNames = ['Larsen', 'Mensah', 'Novak', 'Okoro', 'Petrov', 'Quintero', 'Rahman', 'Silva', 'Tanaka', 'Usman', 'Varga', 'Walsh', 'Xu', 'Yilmaz', 'Zhou', 'Andersen', 'Brooks', 'Costa', 'Dubois', 'Eriksen', 'Fischer', 'Garcia', 'Haddad', 'Ivanov', 'Jensen', 'Khan', 'Lopez', 'Moreno', 'Nakamura', 'Ortega', 'Park', 'Rossi', 'Sato', 'Torres']
const roles: UserRole[] = ['Admin', 'Editor', 'Viewer', 'Billing']
const statuses: UserStatus[] = ['active', 'active', 'active', 'pending', 'suspended']

/** Deterministic pseudo-random so the demo and tests are stable. */
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeUsers(total = 78): User[] {
  const rand = mulberry32(42)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
  const users: User[] = seed.map(([name, email, role, status, createdAt], i) => ({
    id: `u_${String(i + 1).padStart(3, '0')}`,
    name,
    email,
    role,
    status,
    createdAt,
  }))
  const used = new Set(users.map((u) => u.name))
  while (users.length < total) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`
    if (used.has(name)) continue
    used.add(name)
    const [first, last] = name.toLowerCase().split(' ')
    const year = 2025 + (rand() < 0.4 ? 0 : 1)
    const month = 1 + Math.floor(rand() * 12)
    const day = 1 + Math.floor(rand() * 28)
    users.push({
      id: `u_${String(users.length + 1).padStart(3, '0')}`,
      name,
      email: `${first}.${last}@northwind.io`,
      role: pick(roles),
      status: pick(statuses),
      createdAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }
  return users
}

export const users: User[] = makeUsers()
