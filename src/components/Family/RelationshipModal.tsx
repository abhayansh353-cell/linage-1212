import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Heart, Baby } from 'lucide-react';
import { Person, Relationship } from '../../types';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onAddRelationship: (person1Id: string, person2Id: string, type: Relationship['relationship_type']) => Promise<void>;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  people,
  onAddRelationship
}) => {
  const [person1Id, setPerson1Id] = useState('');
  const [person2Id, setPerson2Id] = useState('');
  const [relationshipType, setRelationshipType] = useState<Relationship['relationship_type']>('parent-child');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person1Id || !person2Id || person1Id === person2Id) return;

    setIsSubmitting(true);
    try {
      await onAddRelationship(person1Id, person2Id, relationshipType);
      setPerson1Id('');
      setPerson2Id('');
      setRelationshipType('parent-child');
      onClose();
    } catch (error) {
      console.error('Error adding relationship:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationshipOptions = [
    { value: 'parent-child', label: 'Parent-Child', icon: Baby },
    { value: 'spouse', label: 'Spouse', icon: Heart },
    { value: 'sibling', label: 'Sibling', icon: Users },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Relationship</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Person
                </label>
                <select
                  value={person1Id}
                  onChange={(e) => setPerson1Id(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Type
                </label>
                <div className="space-y-2">
                  {relationshipOptions.map(({ value, label, icon: Icon }) => (
                    <label key={value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        value={value}
                        checked={relationshipType === value}
                        onChange={(e) => setRelationshipType(e.target.value as Relationship['relationship_type'])}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Person
                </label>
                <select
                  value={person2Id}
                  onChange={(e) => setPerson2Id(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select a person</option>
                  {people.filter(p => p.id !== person1Id).map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || !person1Id || !person2Id || person1Id === person2Id}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Add Relationship'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};