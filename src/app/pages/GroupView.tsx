import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, UserPlus, MoreVertical, Plus, Edit2, Trash2, Check, X, RotateCcw } from 'lucide-react';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { AddRubricItemDialog } from '../components/AddRubricItemDialog';
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
} from '../components/ui/alert-dialog';
import {
  GruposDB,
  MiembrosDB,
  ReglasDB,
  type Miembro,
  type Regla,
} from '../lib/db';

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
  onUpdatePuntaje: (id: number, puntaje: number) => void;
}

function MemberRow({ member, onEdit, onDelete, onUpdatePuntaje }: MemberRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(member.puntaje.toString());

  const handleConfirm = () => {
    const val = parseInt(draft, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdatePuntaje(member.id, val);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(member.puntaje.toString());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3">
      {/* Info del miembro */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-gray-200 rounded text-xs font-bold text-gray-700">
          {member.listNumber}
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {member.avatar}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h3>
        </div>
      </div>

      {/* Puntaje editable */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={draft}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-16 px-2 py-1 text-sm border border-blue-400 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">pts</span>
            <button
              onClick={handleConfirm}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Confirmar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setDraft(member.puntaje.toString()); setEditing(true); }}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
            title="Editar puntaje"
          >
            <span>{member.puntaje}</span>
            <span className="text-indigo-400 font-normal text-xs">pts</span>
          </button>
        )}

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
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span>Editar</span>
            </DropdownMenuItem>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que deseas eliminar a **{member.name}**? Esta acción no se puede deshacer.
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
  const [editingMember, setEditingMember] = useState<MemberUI | null>(null);
  const [isAddRubricDialogOpen, setIsAddRubricDialogOpen] = useState(false);
  const [editingRubricItem, setEditingRubricItem] = useState<RubricItemUI | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] = useState(false);

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

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadGroupData();
  }, [navigate, loadGroupData]);

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

  const onAddMember = (data: Omit<MemberUI, 'id'>) => {
    const parts = data.name.split(' ');
    MiembrosDB.create(gId, {
      idLista: data.listNumber,
      nombre: parts[0] ?? '',
      apPaterno: parts[1] ?? '',
      apMaterno: parts.slice(2).join(' '),
    });
    loadGroupData();
  };

  const onEditMember = (updated: MemberUI) => {
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

  const handleUpdatePuntaje = (id: number, puntaje: number) => {
    MiembrosDB.updatePuntaje(id, puntaje);
    loadGroupData();
  };

  const handleDeleteMember = (id: number) => {
    MiembrosDB.delete(id, gId);
    loadGroupData();
  };

  const handleOpenEditMemberDialog = (member: MemberUI) => {
    setEditingMember(member);
    setIsAddMemberDialogOpen(true);
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

  const handleDeleteRubricItem = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      ReglasDB.delete(id, gId);
      loadGroupData();
    }
  };

  const handleOpenEditRubricDialog = (item: RubricItemUI) => {
    setEditingRubricItem(item);
    setIsAddRubricDialogOpen(true);
  };

  const handleStartPresentations = () => {
    console.log('Iniciar presentaciones');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Resetear puntajes"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción reseteará a 0 el puntaje de **todos** los miembros del grupo "{groupName}". Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetScores}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Sí, resetear puntajes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog open={isDeleteGroupConfirmOpen} onOpenChange={setIsDeleteGroupConfirmOpen}>
                <button
                  onClick={() => setIsDeleteGroupConfirmOpen(true)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar grupo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este grupo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará el grupo "{groupName}", todos sus miembros y sus reglas de rúbrica. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteGroup}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Sí, eliminar grupo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Members Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Miembros</h2>
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md"
              >
                <UserPlus className="w-5 h-5" />
                Añadir Miembro
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[560px] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onEdit={handleOpenEditMemberDialog}
                    onDelete={handleDeleteMember}
                    onUpdatePuntaje={handleUpdatePuntaje}
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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Reglas de Rúbrica</h2>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  Total: {rubricItems.reduce((acc, item) => acc + item.points, 0)} pts
                </div>
              </div>
              <button
                onClick={handleAddRubricItem}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                Añadir Regla
              </button>
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
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRubricItem(item.id)}
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
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

        {/* Start Presentations Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartPresentations}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-2xl transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            Iniciar Presentaciones
          </button>
        </div>
      </main>

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
    </div>
  );
}