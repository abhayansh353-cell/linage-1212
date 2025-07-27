import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Briefcase, Edit3, Trash2 } from 'lucide-react';
import { Person } from '../../types';
import { format } from 'date-fns';

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  onClick?: (person: Person) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit, onDelete, onClick }) => {
  const birthYear = person.birth_date ? format(new Date(person.birth_date), 'yyyy') : null;
  const deathYear = person.death_date ? format(new Date(person.death_date), 'yyyy') : null;
  const lifeSpan = birthYear ? `${birthYear}${deathYear ? ` - ${deathYear}` : ' - Present'}` : 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onClick?.(person)}
    >
      <div className="relative">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={`${person.first_name} ${person.last_name}`}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <User className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex space-x-2">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(person);
              }}
              className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(person);
              }}
              className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${
          person.gender === 'male' 
            ? 'bg-blue-100 text-blue-800' 
            : person.gender === 'female'
            ? 'bg-pink-100 text-pink-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {person.gender}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {person.first_name} {person.last_name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{lifeSpan}</span>
          </div>

          {person.birth_place && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{person.birth_place}</span>
            </div>
          )}

          {person.occupation && (
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>{person.occupation}</span>
            </div>
          )}
        </div>

        {person.bio && (
          <p className="mt-4 text-sm text-gray-700 line-clamp-3">
            {person.bio}
          </p>
        )}
      </div>
    </motion.div>
  );
};