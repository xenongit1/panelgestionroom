export interface Reservation {
  id: string;
  client: string;
  room: string;
  date: string;
  time: string;
  gameMaster: string;
  status: "confirmada" | "pendiente" | "cancelada";
  players: number;
}

export interface Room {
  id: string;
  name: string;
  theme: string;
  difficulty: number;
  capacity: number;
  active: boolean;
}

export interface GameMaster {
  id: string;
  name: string;
  avatar: string;
  available: boolean;
  rooms: string[];
}

export const mockRooms: Room[] = [
  { id: "r1", name: "La Cripta del Faraón", theme: "Egipto", difficulty: 4, capacity: 6, active: true },
  { id: "r2", name: "Laboratorio Zombie", theme: "Terror", difficulty: 5, capacity: 5, active: true },
  { id: "r3", name: "El Tren de Medianoche", theme: "Misterio", difficulty: 3, capacity: 8, active: true },
  { id: "r4", name: "La Máquina del Tiempo", theme: "Ciencia Ficción", difficulty: 4, capacity: 4, active: true },
  { id: "r5", name: "Piratas del Caribe", theme: "Aventura", difficulty: 2, capacity: 6, active: false },
];

export const mockGameMasters: GameMaster[] = [
  { id: "gm1", name: "Carlos Ruiz", avatar: "CR", available: true, rooms: ["La Cripta del Faraón", "El Tren de Medianoche"] },
  { id: "gm2", name: "Ana Martínez", avatar: "AM", available: true, rooms: ["Laboratorio Zombie"] },
  { id: "gm3", name: "David López", avatar: "DL", available: false, rooms: ["La Máquina del Tiempo", "Piratas del Caribe"] },
  { id: "gm4", name: "Lucía Fernández", avatar: "LF", available: true, rooms: ["La Cripta del Faraón", "Laboratorio Zombie"] },
];

export const mockReservations: Reservation[] = [
  { id: "res1", client: "María García", room: "La Cripta del Faraón", date: "2026-03-18", time: "10:00", gameMaster: "Carlos Ruiz", status: "confirmada", players: 5 },
  { id: "res2", client: "Pedro Sánchez", room: "Laboratorio Zombie", date: "2026-03-18", time: "11:30", gameMaster: "Ana Martínez", status: "confirmada", players: 4 },
  { id: "res3", client: "Laura Díaz", room: "El Tren de Medianoche", date: "2026-03-18", time: "13:00", gameMaster: "Carlos Ruiz", status: "pendiente", players: 6 },
  { id: "res4", client: "Javier Moreno", room: "La Máquina del Tiempo", date: "2026-03-18", time: "15:00", gameMaster: "Lucía Fernández", status: "confirmada", players: 3 },
  { id: "res5", client: "Elena Torres", room: "La Cripta del Faraón", date: "2026-03-18", time: "17:30", gameMaster: "Lucía Fernández", status: "pendiente", players: 4 },
  { id: "res6", client: "Roberto Muñoz", room: "Laboratorio Zombie", date: "2026-03-17", time: "19:00", gameMaster: "Ana Martínez", status: "cancelada", players: 5 },
  { id: "res7", client: "Sofía Navarro", room: "El Tren de Medianoche", date: "2026-03-17", time: "10:00", gameMaster: "Carlos Ruiz", status: "confirmada", players: 7 },
  { id: "res8", client: "Miguel Ángel Ramos", room: "La Máquina del Tiempo", date: "2026-03-17", time: "12:00", gameMaster: "David López", status: "confirmada", players: 4 },
  { id: "res9", client: "Carmen Herrera", room: "La Cripta del Faraón", date: "2026-03-16", time: "16:00", gameMaster: "Lucía Fernández", status: "cancelada", players: 6 },
  { id: "res10", client: "Antonio Ruiz", room: "Laboratorio Zombie", date: "2026-03-16", time: "18:30", gameMaster: "Ana Martínez", status: "confirmada", players: 3 },
];

export const mockProfile = {
  business_name: "Escape Room Madrid Centro",
  owner_name: "Alejandro Vega",
  email: "alejandro@escaperoommadrid.com",
  access_key: "GR-7X9K2-MN4P8-QW3R5",
  plan_status: "active" as const,
  subscription_end: "2026-12-31",
};

export const todayReservations = mockReservations
  .filter((r) => r.date === "2026-03-18")
  .sort((a, b) => a.time.localeCompare(b.time));

export const kpiData = {
  totalReservations: 147,
  totalReservationsTrend: 12.5,
  activeRooms: mockRooms.filter((r) => r.active).length,
  newClients: 38,
  newClientsTrend: 8.2,
  availableGameMasters: mockGameMasters.filter((gm) => gm.available).length,
  totalGameMasters: mockGameMasters.length,
};
