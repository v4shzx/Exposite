import { Users } from 'lucide-react';

interface GroupCardProps {
  name: string;
  memberCount: number;
  onJoin: () => void;
}

export function GroupCard({ name, memberCount, onJoin }: GroupCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {memberCount} {memberCount === 1 ? 'integrante' : 'integrantes'}
            </span>
          </div>
        </div>
        
        <button
          onClick={onJoin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}
