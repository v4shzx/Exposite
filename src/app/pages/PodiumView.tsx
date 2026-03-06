import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Trophy, Trash2, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GruposDB, MiembrosDB, EvaluacionesDB } from '../lib/db';
import { useAuth } from '../lib/useAuth';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import packageInfo from '../../../package.json';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface AggregatedMember {
    idLista: number;
    nombre: string;
    scores: { evaluador: string; puntaje: number }[];
    promedio: number;
}

// ── Componente principal ─────────────────────────────────────────────────────

export function PodiumView() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const gId = Number(groupId);
    useAuth();

    const [groupName, setGroupName] = useState('');
    const [aggregated, setAggregated] = useState<AggregatedMember[]>([]);
    const [evaluadores, setEvaluadores] = useState<string[]>([]);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

    const loadData = useCallback(() => {
        const grupo = GruposDB.getById(gId);
        setGroupName(grupo?.nombre ?? 'Grupo');

        const evals = EvaluacionesDB.getByGrupo(gId);
        const evaluadorNames = [...new Set(evals.map((e) => e.evaluador))];
        setEvaluadores(evaluadorNames);

        // Build map: idLista -> aggregated scores
        const members = MiembrosDB.getByGrupo(gId);
        const map = new Map<number, AggregatedMember>();

        for (const m of members) {
            const fullName = `${m.nombre} ${m.apPaterno} ${m.apMaterno}`.trim();
            map.set(m.idLista, { idLista: m.idLista, nombre: fullName, scores: [], promedio: 0 });
        }

        for (const ev of evals) {
            for (const em of ev.miembros) {
                const entry = map.get(em.idLista);
                if (entry) {
                    entry.scores.push({ evaluador: ev.evaluador, puntaje: em.puntaje });
                }
            }
        }

        // Calculate averages
        for (const entry of map.values()) {
            if (entry.scores.length > 0) {
                entry.promedio =
                    entry.scores.reduce((acc, s) => acc + s.puntaje, 0) / entry.scores.length;
            }
        }

        // Sort by average descending
        const sorted = Array.from(map.values()).sort((a, b) => b.promedio - a.promedio);
        setAggregated(sorted);
    }, [gId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleClearEvals = () => {
        EvaluacionesDB.clear(gId);
        loadData();
        setIsClearConfirmOpen(false);
    };

    const top3 = useMemo(() => aggregated.slice(0, 3), [aggregated]);
    const maxPromedio = useMemo(
        () => (top3.length > 0 ? top3[0].promedio : 1),
        [top3]
    );

    // ── Export podium PDF ───────────────────────────────────────────────────────

    const handleExportPDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(33, 37, 41);
        doc.text(`Podio — ${groupName}`, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.text(`Evaluadores (${evaluadores.length}): ${evaluadores.join(', ')}`, 14, 37);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 41, 196, 41);

        const tableData = aggregated.map((m, i) => [
            `${i + 1}`,
            `#${m.idLista}`,
            m.nombre,
            m.promedio.toFixed(1),
        ]);

        autoTable(doc, {
            startY: 47,
            head: [['Pos.', 'No. Lista', 'Nombre', 'Puntaje Promedio']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 20 },
                1: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 40 },
            },
            styles: { fontSize: 10, cellPadding: 5 },
            alternateRowStyles: { fillColor: [245, 247, 251] },
        });

        const fileName = `Podio_${groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        const isDesktop = !!(window as any).__TAURI_INTERNALS__;

        if (isDesktop) {
            try {
                const { save } = await import('@tauri-apps/plugin-dialog');
                const { writeFile } = await import('@tauri-apps/plugin-fs');
                const path = await save({ defaultPath: fileName, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
                if (path) {
                    await writeFile(path, new Uint8Array(doc.output('arraybuffer')));
                }
            } catch {
                doc.save(fileName);
            }
        } else {
            doc.save(fileName);
        }
    };

    // ── Podium colors & medals ────────────────────────────────────────────────

    const podiumConfig = [
        { medal: '🥇', bg: 'bg-gradient-to-br from-yellow-300 to-amber-400', text: 'text-amber-900', border: 'border-yellow-400', barBg: 'bg-gradient-to-t from-yellow-400 to-amber-300', shadow: 'shadow-yellow-200/60' },
        { medal: '🥈', bg: 'bg-gradient-to-br from-gray-200 to-gray-300', text: 'text-gray-700', border: 'border-gray-300', barBg: 'bg-gradient-to-t from-gray-300 to-gray-200', shadow: 'shadow-gray-200/60' },
        { medal: '🥉', bg: 'bg-gradient-to-br from-orange-200 to-orange-300', text: 'text-orange-800', border: 'border-orange-300', barBg: 'bg-gradient-to-t from-orange-300 to-orange-200', shadow: 'shadow-orange-200/60' },
    ];

    // Podium display order: 2nd, 1st, 3rd
    const podiumOrder = top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{groupName}</p>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Podio
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FileDown className="w-4 h-4" /> PDF
                        </button>
                        <button
                            onClick={() => setIsClearConfirmOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Limpiar
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* Stats bar */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Evaluadores</p>
                        <p className="text-2xl font-black text-indigo-600">{evaluadores.length}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Miembros</p>
                        <p className="text-2xl font-black text-indigo-600">{aggregated.length}</p>
                    </div>
                </div>

                {aggregated.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <Trophy className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No hay evaluaciones importadas</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Importa archivos JSON de evaluadores desde la vista del grupo.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Podium visual */}
                        <section className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
                            {podiumOrder.map((idx) => {
                                const member = top3[idx];
                                if (!member) return null;
                                const cfg = podiumConfig[idx];
                                const barHeight = maxPromedio > 0 ? (member.promedio / maxPromedio) * 100 : 0;
                                const heightPx = Math.max(60, Math.round((barHeight / 100) * 180));

                                return (
                                    <div key={member.idLista} className="flex flex-col items-center" style={{ width: idx === 0 ? '140px' : '120px' }}>
                                        {/* Medal + avatar */}
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cfg.bg} border-4 ${cfg.border} flex items-center justify-center text-2xl shadow-lg ${cfg.shadow} mb-2 transition-transform hover:scale-110`}>
                                            {cfg.medal}
                                        </div>
                                        <p className={`text-xs sm:text-sm font-bold ${cfg.text} text-center truncate w-full mb-1`}>
                                            {member.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2">{member.promedio.toFixed(1)} pts</p>
                                        {/* Bar */}
                                        <div
                                            className={`w-full ${cfg.barBg} rounded-t-xl shadow-md transition-all duration-700 ease-out`}
                                            style={{ height: `${heightPx}px` }}
                                        />
                                    </div>
                                );
                            })}
                        </section>

                        {/* Full ranking table */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Ranking Completo</h2>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-indigo-600 text-white">
                                                <th className="px-4 py-3 text-center font-bold">#</th>
                                                <th className="px-4 py-3 text-center font-bold">Lista</th>
                                                <th className="px-4 py-3 text-left font-bold">Nombre</th>
                                                {evaluadores.map((ev) => (
                                                    <th key={ev} className="px-4 py-3 text-center font-bold truncate max-w-[100px]" title={ev}>
                                                        {ev}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-center font-bold">Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aggregated.map((m, i) => (
                                                <tr
                                                    key={m.idLista}
                                                    className={`border-t border-gray-100 ${i < 3 ? 'bg-indigo-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/60 transition-colors`}
                                                >
                                                    <td className="px-4 py-3 text-center font-bold text-gray-700">
                                                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-500">{m.idLista}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{m.nombre}</td>
                                                    {evaluadores.map((ev) => {
                                                        const s = m.scores.find((sc) => sc.evaluador === ev);
                                                        return (
                                                            <td key={ev} className="px-4 py-3 text-center text-gray-600">
                                                                {s !== undefined ? s.puntaje : '—'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-4 py-3 text-center font-bold text-indigo-700">
                                                        {m.promedio.toFixed(1)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto mt-12 pb-12 text-center opacity-40 px-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                    © 2026 Alejandro Balderas Rios
                </p>
                <p className="text-[9px] text-gray-400 font-medium">
                    Prohibida la reproducción total o parcial sin autorización.
                </p>
            </footer>
            <div className="fixed bottom-4 right-4 text-[10px] font-mono text-gray-400 opacity-50 z-50">
                v{packageInfo.version}
            </div>

            {/* Clear confirm dialog */}
            <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Limpiar evaluaciones importadas?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminarán todas las evaluaciones importadas para este grupo. Los puntajes individuales de cada miembro no se verán afectados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearEvals} className="bg-red-600 hover:bg-red-700 text-white border-0">
                            Sí, limpiar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
