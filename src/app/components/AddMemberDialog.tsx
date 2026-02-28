import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Datos que este diálogo maneja (sin avatar ni puntaje — se calculan en la capa de datos)
export interface MemberFormData {
  id?: number;
  listNumber: number;
  name: string;
}

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (data: Omit<MemberFormData, 'id'>) => void;
  onEditMember?: (data: MemberFormData & { id: number }) => void;
  initialData?: MemberFormData | null;
}

export function AddMemberDialog({ isOpen, onClose, onAddMember, onEditMember, initialData }: AddMemberDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');
  const [listNumber, setListNumber] = useState('');

  useEffect(() => {
    if (initialData) {
      // Separar el nombre compuesto
      const parts = initialData.name.split(' ');
      setFirstName(parts[0] || '');
      setPaternalLastName(parts[1] || '');
      setMaternalLastName(parts.slice(2).join(' ') || '');
      setListNumber(initialData.listNumber.toString());
    } else {
      setFirstName('');
      setPaternalLastName('');
      setMaternalLastName('');
      setListNumber('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && paternalLastName.trim() && listNumber.trim()) {
      const fullName = `${firstName.trim()} ${paternalLastName.trim()} ${maternalLastName.trim()}`.trim();
      const parsedListNumber = parseInt(listNumber);

      if (initialData?.id !== undefined && onEditMember) {
        onEditMember({ id: initialData.id, listNumber: parsedListNumber, name: fullName });
      } else {
        onAddMember({ listNumber: parsedListNumber, name: fullName });
      }

      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Editar Miembro' : 'Añadir Nuevo Miembro'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre(s)
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
              placeholder="Ej. Juan"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Apellido Paterno
              </label>
              <input
                type="text"
                required
                value={paternalLastName}
                onChange={(e) => setPaternalLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                placeholder="Ej. Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Apellido Materno
              </label>
              <input
                type="text"
                value={maternalLastName}
                onChange={(e) => setMaternalLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                placeholder="Ej. López"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              No. Lista
            </label>
            <input
              type="number"
              required
              min="1"
              value={listNumber}
              onChange={(e) => setListNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
              placeholder="Ej. 1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 ${initialData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-xl font-semibold shadow-lg transition-colors text-sm`}
            >
              {initialData ? 'Guardar Cambios' : 'Añadir Miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
