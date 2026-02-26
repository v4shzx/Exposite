import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { GruposDB, MiembrosDB, ReglasDB, type Miembro, type Regla } from '../lib/db';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

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

  const [miembro, setMiembro] = useState<Miembro | null>(null);
  const [scores, setScores] = useState<RubricScore[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const miembros = MiembrosDB.getByGrupo(gId);
    const found = miembros.find((m) => m.id === mId);
    if (!found) {
      navigate(`/group/${gId}`);
      return;
    }
    setMiembro(found);

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
  }, [gId, mId, navigate]);

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

  const totalObtenido = scores.reduce((acc, s) => acc + (s.puntaje || 0), 0);
  const totalMax = scores.reduce((acc, s) => acc + s.maxPuntaje, 0);
  const pct = totalMax > 0 ? Math.round((totalObtenido / totalMax) * 100) : 0;

  const handleSave = () => {
    MiembrosDB.updatePuntaje(mId, totalObtenido);
    setSaved(true);
    setTimeout(() => navigate(`/group/${gId}`), 1200);
  };

  const fullName = miembro
    ? `${miembro.nombre} ${miembro.apPaterno} ${miembro.apMaterno}`.trim()
    : '';

  const grupo = GruposDB.getById(gId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/group/${gId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al grupo</span>
            </button>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                {grupo?.nombre ?? 'Grupo'}
              </p>
              <h1 className="text-xl font-bold text-gray-900">Presentación</h1>
            </div>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Tarjeta del presentador */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
            {miembro
              ? ((miembro.nombre[0] ?? '') + (miembro.apPaterno[0] ?? '')).toUpperCase()
              : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-200 text-sm font-medium mb-0.5">Presentando ahora</p>
            <h2 className="text-2xl font-bold truncate">{fullName}</h2>
          </div>
          {/* Indicador de puntaje total */}
          <div className="text-right shrink-0">
            <p className="text-indigo-200 text-xs">Puntaje</p>
            <p className="text-3xl font-black">{totalObtenido}</p>
            <p className="text-indigo-300 text-xs">/ {totalMax} pts</p>
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
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
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

        {/* Botón guardar */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleSave}
            disabled={saved || !isComplete}
            className={`flex items-center gap-2.5 font-bold px-8 py-3 rounded-xl shadow-md transition-all
              ${saved
                ? 'bg-green-500 text-white cursor-default scale-95'
                : !isComplete
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:scale-105 active:scale-100'
              }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar puntaje
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
