import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { AddGroupDialog } from '../components/AddGroupDialog';
import { GruposDB, MiembrosDB, initializeDB, type Grupo } from '../lib/db';
import { Sidebar, SidebarSection, SidebarSeparator, SidebarButton } from '../components/Sidebar';
import { useAuth, AUTH_KEY, USERNAME_KEY } from '../lib/useAuth';
import packageInfo from '../../../package.json';

interface GroupDisplay {
  id: number;
  name: string;
  memberCount: number;
}

export function Dashboard() {
  const username = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<GroupDisplay[]>([]);
  const navigate = useNavigate();

  // Initialize DB and load groups once on mount
  useMemo(() => {
    initializeDB();
    const grupos = GruposDB.getAll();
    setGroups(
      grupos.map((g: Grupo) => ({
        id: g.id,
        name: g.nombre,
        memberCount: MiembrosDB.getByGrupo(g.id).length,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGroups = () => {
    const grupos = GruposDB.getAll();
    setGroups(
      grupos.map((g: Grupo) => ({
        id: g.id,
        name: g.nombre,
        memberCount: MiembrosDB.getByGrupo(g.id).length,
      }))
    );
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const handleAddGroup = (name: string) => {
    GruposDB.create(name);
    loadGroups();
  };

  const handleJoinGroup = (groupId: number) => {
    navigate(`/group/${groupId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USERNAME_KEY);
    navigate('/');
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
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">{greeting}, {username}</h1>
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

      {/* Add Group Dialog */}
      <AddGroupDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddGroup={handleAddGroup}
      />
    </div>
  );
}