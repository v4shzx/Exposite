import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users, UserPlus, Settings, MoreVertical, Plus } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  role: string;
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
          { id: 1, name: 'Carlos Rodríguez', role: 'Líder de Equipo', avatar: 'CR' },
          { id: 2, name: 'Ana García', role: 'Desarrolladora Frontend', avatar: 'AG' },
          { id: 3, name: 'Luis Martínez', role: 'Desarrollador Backend', avatar: 'LM' },
          { id: 4, name: 'María López', role: 'UI/UX Designer', avatar: 'ML' },
          { id: 5, name: 'Pedro Sánchez', role: 'QA Tester', avatar: 'PS' },
          { id: 6, name: 'Laura Torres', role: 'Desarrolladora Full Stack', avatar: 'LT' },
          { id: 7, name: 'Diego Ramírez', role: 'DevOps Engineer', avatar: 'DR' },
          { id: 8, name: 'Sofia Flores', role: 'Scrum Master', avatar: 'SF' },
        ],
      },
      '2': {
        name: 'Diseño UI/UX',
        members: [
          { id: 1, name: 'María López', role: 'Diseñadora Principal', avatar: 'ML' },
          { id: 2, name: 'Juan Pérez', role: 'Diseñador UI', avatar: 'JP' },
          { id: 3, name: 'Carmen Ruiz', role: 'Diseñadora UX', avatar: 'CR' },
          { id: 4, name: 'Alberto Díaz', role: 'Ilustrador', avatar: 'AD' },
          { id: 5, name: 'Elena Castro', role: 'Motion Designer', avatar: 'EC' },
        ],
      },
      '3': {
        name: 'Marketing Digital',
        members: [
          { id: 1, name: 'Patricia Gómez', role: 'Gerente de Marketing', avatar: 'PG' },
          { id: 2, name: 'Roberto Silva', role: 'SEO Specialist', avatar: 'RS' },
          { id: 3, name: 'Claudia Moreno', role: 'Content Creator', avatar: 'CM' },
          { id: 4, name: 'Fernando Vega', role: 'Social Media Manager', avatar: 'FV' },
          { id: 5, name: 'Gabriela Ortiz', role: 'Email Marketing', avatar: 'GO' },
          { id: 6, name: 'Manuel Herrera', role: 'Analista de Datos', avatar: 'MH' },
          { id: 7, name: 'Valentina Reyes', role: 'Community Manager', avatar: 'VR' },
          { id: 8, name: 'Ricardo Navarro', role: 'PPC Specialist', avatar: 'RN' },
          { id: 9, name: 'Natalia Campos', role: 'Brand Manager', avatar: 'NC' },
          { id: 10, name: 'Andrés Molina', role: 'Growth Hacker', avatar: 'AM' },
          { id: 11, name: 'Isabella Cruz', role: 'Copywriter', avatar: 'IC' },
          { id: 12, name: 'Javier Romero', role: 'Video Editor', avatar: 'JR' },
        ],
      },
      '4': {
        name: 'Gestión de Proyectos',
        members: [
          { id: 1, name: 'Sofia Flores', role: 'Project Manager', avatar: 'SF' },
          { id: 2, name: 'Marcos Gutiérrez', role: 'Coordinador', avatar: 'MG' },
          { id: 3, name: 'Lucía Vargas', role: 'Asistente de Proyectos', avatar: 'LV' },
          { id: 4, name: 'Pablo Jiménez', role: 'Analista de Procesos', avatar: 'PJ' },
          { id: 5, name: 'Daniela Medina', role: 'Agile Coach', avatar: 'DM' },
          { id: 6, name: 'Esteban Rojas', role: 'Product Owner', avatar: 'ER' },
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
    console.log('Añadir nuevo miembro');
    // Aquí implementarías la lógica para añadir miembros
  };

  const handleAddRubricItem = () => {
    console.log('Añadir elemento de rúbrica');
    // Aquí implementarías la lógica para añadir elementos de rúbrica
  };

  const handleStartPresentations = () => {
    console.log('Iniciar presentaciones');
    // Aquí implementarías la lógica para iniciar las presentaciones
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
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
              <h2 className="text-xl font-semibold text-gray-900">Reglas de Rúbrica</h2>
              <button
                onClick={handleAddRubricItem}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                Añadir Elemento
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Criterios de Evaluación</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span><strong>Claridad (25%):</strong> La presentación debe ser clara y fácil de entender</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span><strong>Contenido (30%):</strong> Información relevante y bien estructurada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span><strong>Creatividad (20%):</strong> Originalidad en el enfoque y presentación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span><strong>Tiempo (15%):</strong> Cumplimiento del tiempo asignado (5-7 minutos)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span><strong>Interacción (10%):</strong> Respuesta a preguntas y participación</span>
                    </li>
                  </ul>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Escala de Puntuación</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Excelente (90-100):</strong> Supera las expectativas</p>
                    <p><strong>Bueno (75-89):</strong> Cumple con todos los criterios</p>
                    <p><strong>Satisfactorio (60-74):</strong> Cumple con la mayoría de criterios</p>
                    <p><strong>Necesita Mejorar (&lt;60):</strong> No cumple con los criterios mínimos</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Normas Generales</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>Todas las presentaciones serán evaluadas de forma anónima</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>Se requiere retroalimentación constructiva</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>El orden de presentación será aleatorio</span>
                    </li>
                  </ul>
                </div>
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
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
    </div>
  );
}