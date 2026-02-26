import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, UserPlus, MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { AddRubricItemDialog } from '../components/AddRubricItemDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  GruposDB,
  MiembrosDB,
  ReglasDB,
  type Miembro,
  type Regla,
} from '../lib/db';

// ── Tipos locales (compatibles con los diálogos existentes) ──────────────────

interface MemberUI {
  id: number;
  listNumber: number;
  name: string;
  avatar: string;
}

interface RubricItemUI {
  id: number;
  title: string;
  description: string;
  points: number;
}

// ── Helpers de conversión ────────────────────────────────────────────────────

function miembroToUI(m: Miembro): MemberUI {
  const avatar =
    ((m.nombre[0] ?? '') + (m.apPaterno[0] ?? '')).toUpperCase();
  return {
    id: m.id,
    listNumber: m.idLista,
    name: `${m.nombre} ${m.apPaterno} ${m.apMaterno}`.trim(),
    avatar,
  };
}

function reglaToUI(r: Regla): RubricItemUI {
  return { id: r.id, title: r.titulo, description: r.descripcion, points: r.puntaje };
}

// ── Componente ───────────────────────────────────────────────────────────────

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

  // ── Navegación ─────────────────────────────────────────────────────────────

  const handleBack = () => navigate('/dashboard');

  // ── Grupo ──────────────────────────────────────────────────────────────────

  const handleDeleteGroup = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.')) {
      GruposDB.delete(gId);
      navigate('/dashboard');
    }
  };

  // ── Miembros ───────────────────────────────────────────────────────────────

  const handleAddMember = () => {
    setEditingMember(null);
    setIsAddMemberDialogOpen(true);
  };

  const onAddMember = (data: Omit<MemberUI, 'id'>) => {
    // Desglosar nombre compuesto para almacenarlo normalizado
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
    const miembro: Miembro = {
      id: updated.id,
      grupoId: gId,
      idLista: updated.listNumber,
      nombre: parts[0] ?? '',
      apPaterno: parts[1] ?? '',
      apMaterno: parts.slice(2).join(' '),
    };
    MiembrosDB.update(miembro);
    setEditingMember(null);
    loadGroupData();
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
      MiembrosDB.delete(id, gId);
      loadGroupData();
    }
  };

  const handleOpenEditMemberDialog = (member: MemberUI) => {
    setEditingMember(member);
    setIsAddMemberDialogOpen(true);
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
              <button
                onClick={handleDeleteGroup}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar grupo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
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
                  <div
                    key={member.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded text-xs font-bold text-gray-700">
                        {member.listNumber}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 bg-white">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditMemberDialog(member)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteMember(member.id)}
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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