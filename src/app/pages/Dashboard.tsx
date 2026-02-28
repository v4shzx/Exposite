import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { AddGroupDialog } from '../components/AddGroupDialog';
import { GruposDB, MiembrosDB, initializeDB, type Grupo } from '../lib/db';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

interface GroupDisplay {
  id: number;
  name: string;
  memberCount: number;
}

export function Dashboard() {
  const [username, setUsername] = useState('Usuario');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<GroupDisplay[]>([]);
  const navigate = useNavigate();

  const loadGroups = () => {
    const grupos = GruposDB.getAll();
    const display: GroupDisplay[] = grupos.map((g: Grupo) => ({
      id: g.id,
      name: g.nombre,
      memberCount: MiembrosDB.getByGrupo(g.id).length,
    }));
    setGroups(display);
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Inicializar la BD con datos de ejemplo si está vacía
    initializeDB();
    loadGroups();
  }, [navigate]);

  const handleAddGroup = (name: string) => {
    GruposDB.create(name);
    loadGroups();
  };

  const handleJoinGroup = (groupId: number) => {
    navigate(`/group/${groupId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 shadow-sm flex-shrink-0 flex flex-col">
        <div className="p-6 flex flex-col gap-8 h-full">
          {/* User Info */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              ¡Hola! {username}
            </h1>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Actions Section */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-3 w-full text-left bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-3 px-4 rounded-xl transition-all border border-blue-100"
              >
                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Nuevo Grupo</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left bg-red-50 text-red-700 hover:bg-red-100 font-semibold py-3 px-4 rounded-xl transition-all border border-red-100"
              >
                <div className="bg-red-600 p-1.5 rounded-lg text-white">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Footer of Sidebar */}
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium tracking-tight">Preferencias</span>
            <ThemeToggleButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Page Header Area */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mis Grupos</h1>
              <p className="text-gray-500 mt-2 font-medium">
                {groups.length} {groups.length === 1 ? 'grupo creado' : 'grupos creados'}
              </p>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  name={group.name}
                  memberCount={group.memberCount}
                  onJoin={() => handleJoinGroup(group.id)}
                />
              ))}
            </div>

            {groups.length === 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes grupos todavía</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  ¡Añade tu primer grupo usando el botón de la barra lateral para comenzar a evaluar!
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Group Dialog */}
      <AddGroupDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddGroup={handleAddGroup}
      />
    </div>
  );
}