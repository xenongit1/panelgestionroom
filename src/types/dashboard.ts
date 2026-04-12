export interface Profile {
  id: string;
  email: string | null;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  country: string | null;
  city: string | null;
  access_key: string | null;
  plan_status: string | null;
  plan_type: string;
  subscription_end: string | null;
}

export interface Sala {
  id: string;
  name: string;
  theme: string | null;
  difficulty: number;
  capacity: number;
  active: boolean;
  profile_id: string;
  created_at: string;
}

export interface GameMaster {
  id: string;
  name: string;
  avatar: string | null;
  available: boolean;
  profile_id: string;
  created_at: string;
}

export interface Reserva {
  id: string;
  client_name: string;
  sala_id: string;
  date: string;
  time: string;
  game_master_id: string | null;
  status: string;
  players: number;
  profile_id: string;
  created_at: string;
  notes?: string | null;
  salas?: { name: string } | null;
  game_masters?: { name: string } | null;
}

export interface KPIs {
  totalReservations: number;
  activeRooms: number;
  totalRooms: number;
  availableGameMasters: number;
  totalGameMasters: number;
}

export interface MonthlyStats {
  totalGroups: number;
  estimatedRevenue: number;
  occupationEstimate: number;
  isEstimated: boolean;
}

export interface NextSession {
  id: string;
  client_name: string;
  time: string;
  date: string;
  players: number;
  status: string;
  notes?: string | null;
  salas?: { name: string } | null;
  game_masters?: { name: string } | null;
}

export interface WeeklyDay {
  date: string;
  count: number;
  capacity: number;
}

export interface DashboardData {
  kpis: KPIs;
  reservations: Reserva[];
  todayReservations: Reserva[];
  salas: Sala[];
  gameMasters: GameMaster[];
  monthlyStats: MonthlyStats;
  nextSession: NextSession | null;
  weeklyOccupation: WeeklyDay[];
}
