/**
 * db.ts — Capa de acceso a datos usando localStorage.
 *
 * Tablas simuladas:
 *   grupos   : { id, nombre, listaMiembros: number[], listaRubrica: number[] }
 *   miembros : { id, idLista, nombre, apPaterno, apMaterno, puntaje, grupoId }
 *   reglas   : { id, titulo, descripcion, puntaje, grupoId }
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Grupo {
  id: number;
  nombre: string;
  listaMiembros: number[];  // array de IDs de miembros
  listaRubrica: number[];   // array de IDs de reglas
}

export interface Miembro {
  id: number;
  grupoId: number;
  idLista: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  puntaje: number;  // puntaje individual del miembro (0 por defecto)
}

export interface Regla {
  id: number;
  grupoId: number;
  titulo: string;
  descripcion: string;
  puntaje: number;
}

// ─── Claves de almacenamiento ─────────────────────────────────────────────────

const KEYS = {
  grupos: 'exposite_grupos',
  miembros: 'exposite_miembros',
  reglas: 'exposite_reglas',
} as const;

// ─── Helpers genéricos ────────────────────────────────────────────────────────

function loadTable<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveTable<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(table: T[]): number {
  return table.length > 0 ? Math.max(...table.map((r) => r.id)) + 1 : 1;
}

// ─── Inicialización con datos de ejemplo ──────────────────────────────────────

export function initializeDB(): void {
  // La base de datos ahora inicia vacía por defecto.
}

// ─── Grupos ───────────────────────────────────────────────────────────────────

export const GruposDB = {
  getAll(): Grupo[] {
    return loadTable<Grupo>(KEYS.grupos);
  },

  getById(id: number): Grupo | undefined {
    return this.getAll().find((g) => g.id === id);
  },

  create(nombre: string): Grupo {
    const table = this.getAll();
    const grupo: Grupo = {
      id: nextId(table),
      nombre,
      listaMiembros: [],
      listaRubrica: [],
    };
    saveTable(KEYS.grupos, [...table, grupo]);
    return grupo;
  },

  update(updated: Grupo): void {
    const table = this.getAll().map((g) => (g.id === updated.id ? updated : g));
    saveTable(KEYS.grupos, table);
  },

  delete(id: number): void {
    // Eliminar grupo, miembros y reglas asociados
    saveTable(KEYS.grupos,  this.getAll().filter((g) => g.id !== id));
    saveTable(KEYS.miembros, loadTable<Miembro>(KEYS.miembros).filter((m) => m.grupoId !== id));
    saveTable(KEYS.reglas,   loadTable<Regla>(KEYS.reglas).filter((r) => r.grupoId !== id));
  },
};

// ─── Miembros ─────────────────────────────────────────────────────────────────

export const MiembrosDB = {
  getByGrupo(grupoId: number): Miembro[] {
    return loadTable<Miembro>(KEYS.miembros)
      .filter((m) => m.grupoId === grupoId)
      .sort((a, b) => a.idLista - b.idLista);
  },

  create(grupoId: number, data: Omit<Miembro, 'id' | 'grupoId' | 'puntaje'>): Miembro {
    const table = loadTable<Miembro>(KEYS.miembros);
    const miembro: Miembro = { id: nextId(table), grupoId, puntaje: 0, ...data };
    saveTable(KEYS.miembros, [...table, miembro]);

    // Actualizar la lista del grupo
    const grupo = GruposDB.getById(grupoId);
    if (grupo) {
      GruposDB.update({ ...grupo, listaMiembros: [...grupo.listaMiembros, miembro.id] });
    }
    return miembro;
  },

  updatePuntaje(id: number, puntaje: number): void {
    const table = loadTable<Miembro>(KEYS.miembros).map((m) =>
      m.id === id ? { ...m, puntaje } : m
    );
    saveTable(KEYS.miembros, table);
  },

  update(updated: Miembro): void {
    const table = loadTable<Miembro>(KEYS.miembros).map((m) =>
      m.id === updated.id ? updated : m
    );
    saveTable(KEYS.miembros, table);
  },

  delete(id: number, grupoId: number): void {
    saveTable(
      KEYS.miembros,
      loadTable<Miembro>(KEYS.miembros).filter((m) => m.id !== id)
    );
    // Actualizar la lista del grupo
    const grupo = GruposDB.getById(grupoId);
    if (grupo) {
      GruposDB.update({
        ...grupo,
        listaMiembros: grupo.listaMiembros.filter((mid) => mid !== id),
      });
    }
  },

  resetPuntajesByGrupo(grupoId: number): void {
    const table = loadTable<Miembro>(KEYS.miembros).map((m) =>
      m.grupoId === grupoId ? { ...m, puntaje: 0 } : m
    );
    saveTable(KEYS.miembros, table);
  },
};

// ─── Sesión de presentaciones ─────────────────────────────────────────────────

/** Devuelve la clave de sessionStorage para la sesión de presentaciones de un grupo. */
export function getSessionKey(groupId: number): string {
  return `pres_session_${groupId}`;
}

// ─── Reglas ───────────────────────────────────────────────────────────────────

export const ReglasDB = {
  getByGrupo(grupoId: number): Regla[] {
    return loadTable<Regla>(KEYS.reglas).filter((r) => r.grupoId === grupoId);
  },

  create(grupoId: number, data: Omit<Regla, 'id' | 'grupoId'>): Regla {
    const table = loadTable<Regla>(KEYS.reglas);
    const regla: Regla = { id: nextId(table), grupoId, ...data };
    saveTable(KEYS.reglas, [...table, regla]);

    // Actualizar la lista del grupo
    const grupo = GruposDB.getById(grupoId);
    if (grupo) {
      GruposDB.update({ ...grupo, listaRubrica: [...grupo.listaRubrica, regla.id] });
    }
    return regla;
  },

  update(updated: Regla): void {
    const table = loadTable<Regla>(KEYS.reglas).map((r) =>
      r.id === updated.id ? updated : r
    );
    saveTable(KEYS.reglas, table);
  },

  delete(id: number, grupoId: number): void {
    saveTable(
      KEYS.reglas,
      loadTable<Regla>(KEYS.reglas).filter((r) => r.id !== id)
    );
    // Actualizar la lista del grupo
    const grupo = GruposDB.getById(grupoId);
    if (grupo) {
      GruposDB.update({
        ...grupo,
        listaRubrica: grupo.listaRubrica.filter((rid) => rid !== id),
      });
    }
  },
};
