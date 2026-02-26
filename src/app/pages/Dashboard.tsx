import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { AddGroupDialog } from '../components/AddGroupDialog';
import { GruposDB, MiembrosDB, initializeDB, type Grupo } from '../lib/db';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola! {username}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Group Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            Añadir Nuevo Grupo
          </button>
        </div>

        {/* Groups Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Grupos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No tienes grupos todavía. ¡Añade tu primer grupo para comenzar!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Add Group Dialog */}
      <AddGroupDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddGroup={handleAddGroup}
      />
    </div>
  );
}