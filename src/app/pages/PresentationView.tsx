import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
import { Sidebar, SidebarButton } from '../components/Sidebar';
import packageInfo from '../../../package.json';
import { GruposDB, MiembrosDB, ReglasDB, getSessionKey, type Miembro, type Regla } from '../lib/db';
import { useAuth } from '../lib/useAuth';

// ── Tipos locales ────────────────────────────────────────────────────────────

interface RubricScore {
  reglaId: number;
  titulo: string;
  descripcion: string;
  maxPuntaje: number;
  puntaje: number | null;
}

// ── Componente principal ─────────────────────────────────────────────────────

export function PresentationView() {
  const { groupId, memberId } = useParams();
  const navigate = useNavigate();
  const gId = Number(groupId);
  const mId = Number(memberId);

  useAuth(); // guard: redirige a '/' si no autenticado

  const [miembro, setMiembro] = useState<Miembro | null>(null);
  const [grupoNombre, setGrupoNombre] = useState('');
  const [scores, setScores] = useState<RubricScore[]>([]);
  const [saved, setSaved] = useState(false);
  const [nextMemberId, setNextMemberId] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const sessionActive = sessionTotal > 0;

  const SESSION_KEY = useMemo(() => getSessionKey(gId), [gId]);

  useEffect(() => {
    // Reset per-member state when mId changes (React reuses component across navigations)
    setSaved(false);
    setNextMemberId(null);
    setAllDone(false);

    const miembros = MiembrosDB.getByGrupo(gId);
    const found = miembros.find((m) => m.id === mId);
    if (!found) {
      navigate(`/group/${gId}`);
      return;
    }
    setMiembro(found);

    // Load group name
    const grupo = GruposDB.getById(gId);
    setGrupoNombre(grupo?.nombre ?? 'Grupo');

    // Read session data (if a presentation session is active)
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.active) {
          setSessionCompleted((s.completedIds ?? []).length);
          setSessionTotal(s.totalCount ?? 0);
        }
      }
    } catch {/* ignore */ }

    const reglas: Regla[] = ReglasDB.getByGrupo(gId);
    setScores(
      reglas.map((r) => ({
        reglaId: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        maxPuntaje: r.puntaje,
        puntaje: null,
      }))
    );
  }, [gId, mId, navigate, SESSION_KEY]);

  const handleScoreChange = (reglaId: number, value: string) => {
    const num = parseInt(value, 10);
    setScores((prev) =>
      prev.map((s) => {
        if (s.reglaId !== reglaId) return s;
        if (value === '') return { ...s, puntaje: null };
        const clamped = isNaN(num) ? 0 : Math.min(Math.max(num, 0), s.maxPuntaje);
        return { ...s, puntaje: clamped };
      })
    );
  };

  const isComplete = scores.length > 0 && scores.every(s => s.puntaje !== null);

  const totalObtenido = useMemo(
    () => scores.reduce((acc, s) => acc + (s.puntaje || 0), 0),
    [scores]
  );
  const totalMax = useMemo(
    () => scores.reduce((acc, s) => acc + s.maxPuntaje, 0),
    [scores]
  );
  const pct = useMemo(
    () => (totalMax > 0 ? Math.round((totalObtenido / totalMax) * 100) : 0),
    [totalObtenido, totalMax]
  );

  const fullName = useMemo(
    () => miembro ? `${miembro.nombre} ${miembro.apPaterno} ${miembro.apMaterno}`.trim() : '',
    [miembro]
  );

  const handleSave = () => {
    MiembrosDB.updatePuntaje(mId, totalObtenido);
    // Mark this member as completed in the active session (if any)
    const raw = sessionStorage.getItem(SESSION_KEY);
    let remaining: number[] = [];
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.active && !s.completedIds.includes(mId)) {
          s.completedIds = [...s.completedIds, mId];
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
          setSessionCompleted(s.completedIds.length);
          // Find remaining uncompleted members
          const allMembers = MiembrosDB.getByGrupo(gId);
          remaining = allMembers
            .map((m) => m.id)
            .filter((id) => !s.completedIds.includes(id));
        }
      } catch {/* ignore */ }
    }
    // Pick random next member (only within session)
    if (sessionActive && remaining.length > 0) {
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      setNextMemberId(pick);
    } else if (sessionActive && remaining.length === 0) {
      setAllDone(true);
    }
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/group/${gId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al grupo</span>
            </button>
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                {grupoNombre}
              </p>
              <h1 className="text-xl font-bold text-gray-900">Presentación</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Session progress bar — only shown when a session is active */}
      {sessionActive && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sesión</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-green-600">✓ {sessionCompleted} presentados</span>
                <span className="text-gray-300">·</span>
                <span className="text-sm font-bold text-indigo-600">
                  {sessionTotal - sessionCompleted} restantes de {sessionTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Tarjeta del presentador */}
        <div className="bg-purple-700 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {miembro
              ? ((miembro.nombre[0] ?? '') + (miembro.apPaterno[0] ?? '')).toUpperCase()
              : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-0.5">Presentando ahora</p>
            <h2 className="text-2xl font-bold text-white truncate">{fullName}</h2>
          </div>
          {/* Indicador de puntaje total */}
          <div className="text-center sm:text-right shrink-0">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Puntaje</p>
            <p className="text-3xl font-black text-white">{totalObtenido}</p>
            <p className="text-purple-300 text-xs">/ {totalMax} pts ({pct}%)</p>
          </div>
        </div>


        {/* Rúbrica */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Criterios de Evaluación</h3>

          {scores.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
              <p>Este grupo no tiene reglas de rúbrica configuradas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((s) => (
                <div
                  key={s.reglaId}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                >
                  {/* Info de la regla */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{s.titulo}</h4>
                    {s.descripcion && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{s.descripcion}</p>
                    )}
                  </div>

                  {/* Input de puntaje */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={s.maxPuntaje}
                      value={s.puntaje ?? ''}
                      onChange={(e) => handleScoreChange(s.reglaId, e.target.value)}
                      placeholder="0"
                      className="w-20 px-3 py-2 text-center text-sm font-bold border-2 border-gray-200 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      / {s.maxPuntaje} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Botón guardar / acciones post-guardado */}
        <div className="flex justify-center pt-2">
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={!isComplete}
              className={`flex items-center gap-2.5 font-bold px-8 py-3 rounded-xl shadow-md transition-all
                ${!isComplete
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:scale-105 active:scale-100'
                }`}
            >
              <Save className="w-5 h-5" />
              Guardar puntaje
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              {/* Confirmación del guardado */}
              <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                <CheckCircle2 className="w-6 h-6" />
                ¡Puntaje guardado!
              </div>

              {sessionActive && (
                allDone ? (
                  <p className="text-indigo-600 font-semibold text-sm">🎉 ¡Todos los miembros han presentado!</p>
                ) : nextMemberId !== null ? (
                  <button
                    onClick={() => navigate(`/group/${gId}/present/${nextMemberId}`)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    Siguiente presentación
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : null
              )}

              <button
                onClick={() => navigate(`/group/${gId}`)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al grupo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto mt-20 pb-12 text-center opacity-40 px-4">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">
            © 2026 Alejandro Balderas Rios
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
            Prohibida la reproducción total o parcial sin autorización.
          </p>
        </footer>
        <div className="fixed bottom-4 right-4 text-[10px] font-mono text-gray-400 opacity-50 z-50">
          v{packageInfo.version}
        </div>
      </main>
    </div>
  );
}
