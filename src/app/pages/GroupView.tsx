import { useState, useEffect } from 'react';
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

interface Member {
  id: number;
  listNumber: number;
  name: string;
  avatar: string;
}

interface RubricItem {
  id: number;
  title: string;
  description: string;
  points: number;
}

export function GroupView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [rubricItems, setRubricItems] = useState<RubricItem[]>([
    { id: 1, title: 'Tiempo', description: 'Mínimo 3 min', points: 10 },
    { id: 2, title: 'Vestimenta', description: 'Formal', points: 10 },
    { id: 3, title: 'Contenido', description: 'Completo y relevante', points: 20 },
    { id: 4, title: 'Claridad', description: 'Mensaje claro y conciso', points: 15 },
    { id: 5, title: 'Material Visual', description: 'Presentación o slides', points: 15 },
    { id: 6, title: 'Dominio del Tema', description: 'Conocimiento profundo', points: 20 },
    { id: 7, title: 'Interacción', description: 'Responde preguntas', points: 10 },
  ]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddRubricDialogOpen, setIsAddRubricDialogOpen] = useState(false);
  const [editingRubricItem, setEditingRubricItem] = useState<RubricItem | null>(null);

  useEffect(() => {
    // Verificar autenticación
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Cargar datos del grupo (simulado)
    loadGroupData();
  }, [groupId, navigate]);

  const loadGroupData = () => {
    // Datos de ejemplo - en una app real esto vendría de una API
    const groupsData: { [key: string]: { name: string; members: Member[] } } = {
      '1': {
        name: 'Equipo de Desarrollo',
        members: [
          { id: 1, listNumber: 1, name: 'Carlos Rodríguez', avatar: 'CR' },
          { id: 2, listNumber: 2, name: 'Ana García', avatar: 'AG' },
          { id: 3, listNumber: 3, name: 'Luis Martínez', avatar: 'LM' },
          { id: 4, listNumber: 4, name: 'María López', avatar: 'ML' },
          { id: 5, listNumber: 5, name: 'Pedro Sánchez', avatar: 'PS' },
          { id: 6, listNumber: 6, name: 'Laura Torres', avatar: 'LT' },
          { id: 7, listNumber: 7, name: 'Diego Ramírez', avatar: 'DR' },
          { id: 8, listNumber: 8, name: 'Sofia Flores', avatar: 'SF' },
        ],
      },
      '2': {
        name: 'Diseño UI/UX',
        members: [
          { id: 1, listNumber: 1, name: 'María López', avatar: 'ML' },
          { id: 2, listNumber: 2, name: 'Juan Pérez', avatar: 'JP' },
          { id: 3, listNumber: 3, name: 'Carmen Ruiz', avatar: 'CR' },
          { id: 4, listNumber: 4, name: 'Alberto Díaz', avatar: 'AD' },
          { id: 5, listNumber: 5, name: 'Elena Castro', avatar: 'EC' },
        ],
      },
      '3': {
        name: 'Marketing Digital',
        members: [
          { id: 1, listNumber: 1, name: 'Patricia Gómez', avatar: 'PG' },
          { id: 2, listNumber: 2, name: 'Roberto Silva', avatar: 'RS' },
          { id: 3, listNumber: 3, name: 'Claudia Moreno', avatar: 'CM' },
          { id: 4, listNumber: 4, name: 'Fernando Vega', avatar: 'FV' },
          { id: 5, listNumber: 5, name: 'Gabriela Ortiz', avatar: 'GO' },
          { id: 6, listNumber: 6, name: 'Manuel Herrera', avatar: 'MH' },
          { id: 7, listNumber: 7, name: 'Valentina Reyes', avatar: 'VR' },
          { id: 8, listNumber: 8, name: 'Ricardo Navarro', avatar: 'RN' },
          { id: 9, listNumber: 9, name: 'Natalia Campos', avatar: 'NC' },
          { id: 10, listNumber: 10, name: 'Andrés Molina', avatar: 'AM' },
          { id: 11, listNumber: 11, name: 'Isabella Cruz', avatar: 'IC' },
          { id: 12, listNumber: 12, name: 'Javier Romero', avatar: 'JR' },
        ],
      },
      '4': {
        name: 'Gestión de Proyectos',
        members: [
          { id: 1, listNumber: 1, name: 'Sofia Flores', avatar: 'SF' },
          { id: 2, listNumber: 2, name: 'Marcos Gutiérrez', avatar: 'MG' },
          { id: 3, listNumber: 3, name: 'Lucía Vargas', avatar: 'LV' },
          { id: 4, listNumber: 4, name: 'Pablo Jiménez', avatar: 'PJ' },
          { id: 5, listNumber: 5, name: 'Daniela Medina', avatar: 'DM' },
          { id: 6, listNumber: 6, name: 'Esteban Rojas', avatar: 'ER' },
        ],
      },
    };

    const group = groupsData[groupId || '1'];
    if (group) {
      setGroupName(group.name);
      setMembers(group.members);
    } else {
      setGroupName('Grupo Desconocido');
      setMembers([]);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsAddMemberDialogOpen(true);
  };

  const onAddMember = (newMemberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: Date.now(),
    };
    setMembers([...members, newMember]);
  };

  const onEditMember = (updatedMember: Member) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    setEditingMember(null);
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleOpenEditDialog = (member: Member) => {
    setEditingMember(member);
    setIsAddMemberDialogOpen(true);
  };

  const handleAddRubricItem = () => {
    setEditingRubricItem(null);
    setIsAddRubricDialogOpen(true);
  };

  const onAddRubricItem = (newItemData: Omit<RubricItem, 'id'>) => {
    const newItem: RubricItem = {
      ...newItemData,
      id: Date.now(),
    };
    setRubricItems([...rubricItems, newItem]);
  };

  const onEditRubricItem = (updatedItem: RubricItem) => {
    setRubricItems(rubricItems.map((item: RubricItem) => item.id === updatedItem.id ? updatedItem : item));
    setEditingRubricItem(null);
  };

  const handleDeleteRubricItem = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta regla de la rúbrica?')) {
      setRubricItems(rubricItems.filter((item: RubricItem) => item.id !== id));
    }
  };

  const handleOpenEditRubricDialog = (item: RubricItem) => {
    setEditingRubricItem(item);
    setIsAddRubricDialogOpen(true);
  };

  const handleStartPresentations = () => {
    console.log('Iniciar presentaciones');
    // Aquí implementarías la lógica para iniciar las presentaciones
  };

  const handleDeleteGroup = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
      // En una app real, aquí llamarías a la API para eliminar el grupo
      navigate('/dashboard');
    }
  };

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
                          onClick={() => handleOpenEditDialog(member)}
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
                <p className="text-gray-500">
                  Este grupo aún no tiene miembros
                </p>
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
                <p className="text-gray-500">
                  No hay elementos en la rúbrica
                </p>
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