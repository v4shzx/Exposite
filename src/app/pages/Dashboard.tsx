import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { AddGroupDialog } from '../components/AddGroupDialog';
import { GruposDB, MiembrosDB, initializeDB, type Grupo } from '../lib/db';
import { Sidebar, SidebarSection, SidebarSeparator, SidebarButton } from '../components/Sidebar';

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
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar>

        <SidebarSection title="Acciones">
          <SidebarButton
            icon={<Plus className="w-5 h-5 flex-shrink-0" />}
            label="Nuevo Grupo"
            onClick={() => setIsDialogOpen(true)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />
          <SidebarButton
            icon={<LogOut className="w-5 h-5 flex-shrink-0" />}
            label="Cerrar Sesión"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
          />
        </SidebarSection>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pt-16 md:pt-8 md:p-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Page Header Area */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">{getGreeting()}, {username}</h1>
              <div className="mt-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mis Grupos</h2>
                <p className="text-gray-500 font-medium">
                  Tienes {groups.length} {groups.length === 1 ? 'grupo registrado' : 'grupos registrados'}
                </p>
              </div>
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
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center">
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