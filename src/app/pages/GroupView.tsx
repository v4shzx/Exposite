import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Users, UserPlus, MoreVertical, Plus, Edit2, Trash2, RotateCcw, Play, FileDown, Home, Flag, Upload, Trophy } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { AddMemberDialog, type MemberFormData } from '../components/AddMemberDialog';
import { AddRubricItemDialog } from '../components/AddRubricItemDialog';
import { Sidebar, SidebarSection, SidebarSeparator, SidebarButton } from '../components/Sidebar';
import { exportGroupJSON, exportMembersJSON, exportRubricJSON } from '../lib/exportEvaluations';
import { ImportEvaluationsDialog } from '../components/ImportEvaluationsDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import {
  EvaluacionesDB,
  GruposDB,
  MiembrosDB,
  ReglasDB,
  getSessionKey,
  type Miembro,
  type Regla,
} from '../lib/db';
import { useAuth } from '../lib/useAuth';
import packageInfo from '../../../package.json';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// ── Tipos locales ──────────────────────────────────────────────────────────────

interface MemberUI {
  id: number;
  listNumber: number;
  name: string;
  avatar: string;
  puntaje: number;
}

interface RubricItemUI {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface ImportedMember {
  idLista: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
}

interface ImportedRubricRule {
  titulo: string;
  descripcion: string;
  description?: string;
  puntaje: number;
}

// ── Helpers de conversión ────────────────────────────────────────────────────

function miembroToUI(m: Miembro): MemberUI {
  const avatar = ((m.nombre[0] ?? '') + (m.apPaterno[0] ?? '')).toUpperCase();
  return {
    id: m.id,
    listNumber: m.idLista,
    name: `${m.nombre} ${m.apPaterno} ${m.apMaterno}`.trim(),
    avatar,
    puntaje: m.puntaje ?? 0,
  };
}

function reglaToUI(r: Regla): RubricItemUI {
  return { id: r.id, title: r.titulo, description: r.descripcion, points: r.puntaje };
}

// ── Sub-componente: fila de miembro con puntaje editable ─────────────────────

interface MemberRowProps {
  member: MemberUI;
  onEdit: (m: MemberUI) => void;
  onDelete: (id: number) => void;
  onPresent: (member: MemberUI) => void;
}

function MemberRow({ member, onEdit, onDelete, onPresent }: MemberRowProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
      {/* Info del miembro */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-gray-200 rounded text-xs font-bold text-gray-700">
          {member.listNumber}
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {member.avatar}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h3>
        </div>
      </div>

      {/* Puntaje (no editable en la lista) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm"
        >
          <span>{member.puntaje}</span>
          <span className="text-indigo-400 font-normal text-xs">pts</span>
        </div>

        {/* Menú de acciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-white">
            <DropdownMenuItem
              onClick={() => onEdit(member)}
              className="flex items-center gap-2 cursor-pointer text-gray-600 focus:text-gray-700"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onPresent(member)}
              className="flex items-center gap-2 cursor-pointer text-gray-600 focus:text-gray-700"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Presentar</span>
            </DropdownMenuItem>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e: Event) => e.preventDefault()}
                  className="flex items-center gap-2 cursor-pointer text-gray-600 focus:text-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar a <strong>{member.name}</strong>? Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(member.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function GroupView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const gId = Number(groupId);

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<MemberUI[]>([]);
  const [rubricItems, setRubricItems] = useState<RubricItemUI[]>([]);

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberFormData | null>(null);
  const [isAddRubricDialogOpen, setIsAddRubricDialogOpen] = useState(false);
  const [editingRubricItem, setEditingRubricItem] = useState<RubricItemUI | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'list' | 'score'>('list');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [evalCount, setEvalCount] = useState(0);
  const memberFileRef = useRef<HTMLInputElement>(null);
  const rubricFileRef = useRef<HTMLInputElement>(null);

  // ── Sesión de presentaciones ───────────────────────────────────────────────
  const SESSION_KEY = useMemo(() => getSessionKey(gId), [gId]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState<number[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);

  const username = useAuth(); // guard: redirige a '/' si no autenticado

  const loadGroupData = useCallback(() => {
    const grupo = GruposDB.getById(gId);
    if (grupo) {
      setGroupName(grupo.nombre);
      setMembers(MiembrosDB.getByGrupo(gId).map(miembroToUI));
      setRubricItems(ReglasDB.getByGrupo(gId).map(reglaToUI));
    } else {
      setGroupName('Grupo no encontrado');
      setMembers([]);
      setRubricItems([]);
    }
  }, [gId]);

  const loadEvalCount = useCallback(() => {
    setEvalCount(EvaluacionesDB.getByGrupo(gId).length);
  }, [gId]);

  useEffect(() => {
    loadGroupData();
    loadEvalCount();
    // Restore session from sessionStorage
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.active) {
          setSessionActive(true);
          setSessionCompleted(s.completedIds ?? []);
          setSessionTotal(s.totalCount ?? 0);
        }
      } catch {/* ignore */ }
    }
  }, [loadGroupData, loadEvalCount, SESSION_KEY]);

  // ── Grupo ──────────────────────────────────────────────────────────────────

  const handleBack = () => navigate('/dashboard');

  const handleDeleteGroup = () => {
    GruposDB.delete(gId);
    navigate('/dashboard');
  };

  // ── Miembros ───────────────────────────────────────────────────────────────

  const handleAddMember = () => {
    setEditingMember(null);
    setIsAddMemberDialogOpen(true);
  };

  const onAddMember = (data: Omit<MemberFormData, 'id'>) => {
    const parts = data.name.split(' ');
    MiembrosDB.create(gId, {
      idLista: data.listNumber,
      nombre: parts[0] ?? '',
      apPaterno: parts[1] ?? '',
      apMaterno: parts.slice(2).join(' '),
    });
    loadGroupData();
  };

  const onEditMember = (updated: MemberFormData & { id: number }) => {
    const parts = updated.name.split(' ');
    const current = MiembrosDB.getByGrupo(gId).find((m) => m.id === updated.id);
    const miembro: Miembro = {
      id: updated.id,
      grupoId: gId,
      idLista: updated.listNumber,
      nombre: parts[0] ?? '',
      apPaterno: parts[1] ?? '',
      apMaterno: parts.slice(2).join(' '),
      puntaje: current?.puntaje ?? 0,
    };
    MiembrosDB.update(miembro);
    setEditingMember(null);
    loadGroupData();
  };


  const handleDeleteMember = (id: number) => {
    MiembrosDB.delete(id, gId);
    loadGroupData();
  };

  const handleOpenEditMemberDialog = (member: MemberUI) => {
    setEditingMember({ id: member.id, listNumber: member.listNumber, name: member.name });
    setIsAddMemberDialogOpen(true);
  };

  const handlePresentMember = (member: MemberUI) => {
    navigate(`/group/${gId}/present/${member.id}`);
  };

  const handleResetScores = () => {
    MiembrosDB.resetPuntajesByGrupo(gId);
    loadGroupData();
    setIsResetConfirmOpen(false);
  };

  // ── Reglas de rúbrica ──────────────────────────────────────────────────────

  const handleAddRubricItem = () => {
    setEditingRubricItem(null);
    setIsAddRubricDialogOpen(true);
  };

  const onAddRubricItem = (data: Omit<RubricItemUI, 'id'>) => {
    ReglasDB.create(gId, {
      titulo: data.title,
      descripcion: data.description,
      puntaje: data.points,
    });
    loadGroupData();
  };

  const onEditRubricItem = (updated: RubricItemUI) => {
    ReglasDB.update({
      id: updated.id,
      grupoId: gId,
      titulo: updated.title,
      descripcion: updated.description,
      puntaje: updated.points,
    });
    setEditingRubricItem(null);
    loadGroupData();
  };

  const [deletingRubricItemId, setDeletingRubricItemId] = useState<number | null>(null);

  const handleDeleteRubricItem = (id: number) => {
    setDeletingRubricItemId(id);
  };

  const confirmDeleteRubricItem = () => {
    if (deletingRubricItemId !== null) {
      ReglasDB.delete(deletingRubricItemId, gId);
      loadGroupData();
      setDeletingRubricItemId(null);
    }
  };

  const handleOpenEditRubricDialog = (item: RubricItemUI) => {
    setEditingRubricItem(item);
    setIsAddRubricDialogOpen(true);
  };

  const handleEndSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSessionActive(false);
    setSessionCompleted([]);
    setSessionTotal(0);
  };

  const handleImportMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tipo === 'miembros' && Array.isArray(data.miembros)) {
          data.miembros.forEach((m: ImportedMember) => {
            MiembrosDB.create(gId, {
              idLista: m.idLista,
              nombre: m.nombre,
              apPaterno: m.apPaterno,
              apMaterno: m.apMaterno,
            });
          });
          loadGroupData();
        }
      } catch (err) {
        console.error('Error importing members:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportRubric = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tipo === 'rubrica' && Array.isArray(data.reglas)) {
          data.reglas.forEach((r: ImportedRubricRule) => {
            ReglasDB.create(gId, {
              titulo: r.titulo,
              descripcion: r.description || r.descripcion, // Support both if modified
              puntaje: r.puntaje,
            });
          });
          loadGroupData();
        }
      } catch (err) {
        console.error('Error importing rubric:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text(`Resultados del Grupo: ${groupName}`, 14, 22);

      // Add subtitle/date
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

      // Add evaluator name
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text(`Evaluado por: ${username || 'Sin nombre'}`, 14, 37);

      // Add a horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 41, 196, 41);

      // Create table data
      // Use sortedMembers to respect the current view preference
      const tableData = sortedMembers.map((m) => [
        m.listNumber.toString(),
        m.name,
        `${m.puntaje}`
      ]);

      // Add table
      autoTable(doc, {
        startY: 47,
        head: [['No. Lista', 'Nombre del Miembro', 'Puntaje (pts)']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229], // Indigo 600
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 30 },
          2: { halign: 'center', cellWidth: 40 }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [245, 247, 251]
        }
      });

      // Save PDF
      const fileName = `Resultados_${groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

      // Check if running in Tauri desktop
      const isDesktop = !!(window as any).__TAURI_INTERNALS__;

      if (isDesktop) {
        try {
          const { save } = await import('@tauri-apps/plugin-dialog');
          const { writeFile } = await import('@tauri-apps/plugin-fs');

          const path = await save({
            defaultPath: fileName,
            filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
          });

          if (path) {
            const pdfContent = doc.output('arraybuffer');
            await writeFile(path, new Uint8Array(pdfContent));
            toast.success('Reporte PDF guardado exitosamente');
          }
        } catch (err) {
          console.error('Error saving PDF in desktop mode:', err);
          toast.error('Error al guardar en escritorio, intentando descarga web...');
          doc.save(fileName);
          toast.success('Descarga iniciada');
        }
      } else {
        // Standard browser download
        doc.save(fileName);
        toast.success('Descarga iniciada');
      }
    } catch (err) {
      console.error('General PDF export error:', err);
      toast.error('No se pudo generar el PDF');
    }
  };

  const handleStartPresentations = () => {
    if (members.length === 0) return;

    let completedIds = sessionCompleted;
    let total = sessionTotal;

    if (!sessionActive) {
      // Start a new session
      completedIds = [];
      total = members.length;
      setSessionActive(true);
      setSessionCompleted([]);
      setSessionTotal(total);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ active: true, completedIds: [], totalCount: total }));
    }

    // Pick a random member who hasn't presented yet
    const remaining = members.filter((m) => !completedIds.includes(m.id));
    if (remaining.length === 0) return; // All done

    const randomMember = remaining[Math.floor(Math.random() * remaining.length)];
    navigate(`/group/${gId}/present/${randomMember.id}`);
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (sortBy === 'score') {
        const scoreDiff = b.puntaje - a.puntaje;
        if (scoreDiff !== 0) return scoreDiff;
        return a.listNumber - b.listNumber;
      }
      return a.listNumber - b.listNumber;
    });
  }, [members, sortBy]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar>
        <SidebarSection title="Navegación">
          <SidebarButton
            icon={<Home className="w-5 h-5 flex-shrink-0" />}
            label="Menu Principal"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />
        </SidebarSection>

        <SidebarSeparator />

        <SidebarSection title="Control de Datos">
          <SidebarButton
            icon={<FileDown className="w-5 h-5 flex-shrink-0" />}
            label="Reporte PDF"
            onClick={handleExportPDF}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />

          <SidebarButton
            icon={<FileDown className="w-5 h-5 flex-shrink-0" />}
            label="Compartir Evaluaciones"
            onClick={() => exportGroupJSON(gId, username)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
            title="Exportar evaluaciones como JSON"
          />

          <SidebarButton
            icon={<Upload className="w-5 h-5 flex-shrink-0" />}
            label="Importar Evaluaciones"
            onClick={() => setIsImportDialogOpen(true)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />
        </SidebarSection>
        <SidebarSection title="Acciones Rápidas">
          <SidebarButton
            icon={<Trophy className="w-5 h-5 flex-shrink-0" />}
            label={`Podio${evalCount > 0 ? ` (${evalCount})` : ''}`}
            onClick={() => navigate(`/group/${gId}/podium`)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />

          <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
            <SidebarButton
              icon={<RotateCcw className="w-5 h-5 flex-shrink-0" />}
              label="Resetear"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
              title="Resetear puntajes"
            />
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción reseteará a 0 el puntaje de TODOS los miembros del grupo "{groupName}". Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetScores} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                  Sí, resetear puntajes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isDeleteGroupConfirmOpen} onOpenChange={setIsDeleteGroupConfirmOpen}>
            <SidebarButton
              icon={<Trash2 className="w-5 h-5 flex-shrink-0" />}
              label="Eliminar Grupo"
              onClick={() => setIsDeleteGroupConfirmOpen(true)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
              title="Eliminar grupo"
            />
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este grupo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el grupo "{groupName}", todos sus miembros y sus reglas de rúbrica. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700 text-white border-0">
                  Sí, eliminar grupo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarSection>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pt-16 md:pt-8 md:p-8">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{groupName}</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                </span>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Presentations Row */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Presentaciones</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                  onClick={handleStartPresentations}
                  disabled={sessionActive && sessionCompleted.length >= sessionTotal}
                  className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg py-3 px-6 sm:py-4 sm:px-8 rounded-xl shadow-lg transform transition-all hover:scale-105 w-full sm:w-auto
                ${sessionActive && sessionCompleted.length >= sessionTotal ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
                >
                  <Flag className="w-5 h-5" />
                  {sessionActive
                    ? sessionCompleted.length >= sessionTotal
                      ? 'Todos presentaron'
                      : 'Siguiente presentación'
                    : 'Iniciar Presentaciones'}
                </button>

                {/* Session counter — only shows when a session is active */}
                {sessionActive && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white border border-gray-200 rounded-2xl shadow-sm px-6 sm:px-8 py-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Presentados</p>
                      <p className="text-2xl font-black text-green-600">{sessionCompleted.length}</p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Restantes</p>
                      <p className="text-2xl font-black text-indigo-600">
                        {sessionTotal - sessionCompleted.length}/{sessionTotal}
                      </p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-gray-200" />
                    <button
                      onClick={handleEndSession}
                      className="text-sm text-red-600 font-medium transition-colors"
                    >
                      Finalizar sesión
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Members Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Miembros</h2>
                  <div className="w-40 sm:w-48">
                    <Select value={sortBy} onValueChange={(val: 'list' | 'score') => setSortBy(val)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">Orden de lista</SelectItem>
                        <SelectItem value="score">Puntaje mayor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => exportMembersJSON(gId, groupName)}
                    className="flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors border border-pink-500 shadow-sm flex-1 sm:flex-none"
                    title="Exportar miembros a JSON"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden md:inline">Exportar</span>
                  </button>
                  <button
                    onClick={() => memberFileRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-yellow-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors border border-yellow-200 shadow-sm flex-1 sm:flex-none"
                    title="Importar miembros desde JSON"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden md:inline">Importar</span>
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md w-full sm:w-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Añadir Miembro</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[560px] overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {sortedMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onEdit={handleOpenEditMemberDialog}
                      onDelete={handleDeleteMember}
                      onPresent={handlePresentMember}
                    />
                  ))}
                </div>
              </div>

              {members.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Este grupo aún no tiene miembros</p>
                </div>
              )}
            </section>

            {/* Rubric Rules Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">Reglas de Rúbrica</h2>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    Total: {rubricItems.reduce((acc, item) => acc + item.points, 0)} pts
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => exportRubricJSON(gId, groupName)}
                    className="flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors border border-pink-500 shadow-sm flex-1 sm:flex-none"
                    title="Exportar rúbrica a JSON"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden md:inline">Exportar</span>
                  </button>
                  <button
                    onClick={() => rubricFileRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-yellow-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors border border-gray-200 shadow-sm flex-1 sm:flex-none"
                    title="Importar rúbrica desde JSON"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden md:inline">Importar</span>
                  </button>
                  <button
                    onClick={handleAddRubricItem}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Regla</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[560px] overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {rubricItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                          {item.points} pts
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-white">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditRubricDialog(item)}
                              className="flex items-center gap-2 cursor-pointer text-gray-600 focus:text-gray-700"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteRubricItem(item.id)}
                              className="flex items-center gap-2 cursor-pointer text-gray-600 focus:text-gray-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {rubricItems.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No hay reglas en la rúbrica</p>
                </div>
              )}
            </section>
          </div>

          <footer className="max-w-6xl mx-auto mt-20 pb-12 text-center opacity-40 px-4">
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

      {/* Modals */}
      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => {
          setIsAddMemberDialogOpen(false);
          setEditingMember(null);
        }}
        onAddMember={onAddMember}
        onEditMember={onEditMember}
        initialData={editingMember}
      />

      {/* AlertDialog para confirmar eliminación de regla de rúbrica */}
      <AlertDialog
        open={deletingRubricItemId !== null}
        onOpenChange={(open) => { if (!open) setDeletingRubricItemId(null); }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta regla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la regla de rúbrica permanentemente. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRubricItem}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddRubricItemDialog
        isOpen={isAddRubricDialogOpen}
        onClose={() => {
          setIsAddRubricDialogOpen(false);
          setEditingRubricItem(null);
        }}
        onAddRubricItem={onAddRubricItem}
        onEditRubricItem={onEditRubricItem}
        initialData={editingRubricItem}
      />

      <ImportEvaluationsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        grupoId={gId}
        onImported={loadEvalCount}
      />

      {/* Inputs de archivo ocultos */}
      <input
        type="file"
        ref={memberFileRef}
        className="hidden"
        accept=".json"
        onChange={handleImportMembers}
      />
      <input
        type="file"
        ref={rubricFileRef}
        className="hidden"
        accept=".json"
        onChange={handleImportRubric}
      />
    </div>
  );
}