import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { AddGroupDialog } from '../components/AddGroupDialog';

interface Group {
  id: number;
  name: string;
  memberCount: number;
}

export function Dashboard() {
  const [username, setUsername] = useState('Usuario');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: 'Equipo de Desarrollo', memberCount: 8 },
    { id: 2, name: 'Diseño UI/UX', memberCount: 5 },
    { id: 3, name: 'Marketing Digital', memberCount: 12 },
    { id: 4, name: 'Gestión de Proyectos', memberCount: 6 },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Obtener el nombre de usuario
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handleAddGroup = (name: string) => {
    const newGroup: Group = {
      id: Date.now(),
      name,
      memberCount: 1,
    };
    setGroups([...groups, newGroup]);
  };

  const handleJoinGroup = (groupId: number) => {
    console.log('Ingresar al grupo:', groupId);
    // Aquí puedes implementar la lógica para ingresar al grupo
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