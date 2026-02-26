import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RubricItem {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface AddRubricItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRubricItem: (item: Omit<RubricItem, 'id'>) => void;
  onEditRubricItem?: (item: RubricItem) => void;
  initialData?: RubricItem | null;
}

export function AddRubricItemDialog({ isOpen, onClose, onAddRubricItem, onEditRubricItem, initialData }: AddRubricItemDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPoints(initialData.points.toString());
    } else {
      setTitle('');
      setDescription('');
      setPoints('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && points.trim()) {
      const rubricItemData = {
        title: title.trim(),
        description: description.trim(),
        points: parseInt(points),
      };

      if (initialData && onEditRubricItem) {
        onEditRubricItem({
          ...initialData,
          ...rubricItemData,
        });
      } else {
        onAddRubricItem(rubricItemData);
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
            {initialData ? 'Editar Regla' : 'Añadir Nueva Regla'}
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
              Título de la Regla
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="Ej. Puntualidad"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm min-h-[100px] resize-none"
              placeholder="Ej. El equipo debe estar listo a la hora acordada"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Puntos
            </label>
            <input
              type="number"
              required
              min="1"
              value={points}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoints(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="Ej. 10"
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
              {initialData ? 'Guardar Cambios' : 'Añadir Regla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
