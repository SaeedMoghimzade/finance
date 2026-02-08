
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
  members: Member[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const MembersManager: React.FC<Props> = ({ members, onAdd, onDelete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name);
      setName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="نام عضو جدید (مثلا: پدر، علی، مریم...)"
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          + افزودن عضو
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center group hover:border-blue-200 transition-colors">
            <span className="text-lg font-medium">{member.name}</span>
            <button 
              onClick={() => onDelete(member.id)}
              className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersManager;
