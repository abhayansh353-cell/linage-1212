'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Plus, Users } from 'lucide-react';
import { Person, Relationship } from '../../types';

interface FamilyTreeBuilderProps {
  people: Person[];
  relationships: Relationship[];
  onAddRelationship: (person1Id: string, person2Id: string, type: Relationship['relationship_type']) => Promise<void>;
}

export const FamilyTreeBuilder: React.FC<FamilyTreeBuilderProps> = ({
  people,
  relationships,
  onAddRelationship
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  if (people.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Family Tree Builder</h3>
          <p className="text-gray-500">Add family members to start building your tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TreePine className="h-6 w-6 text-emerald-600" />
          <h3 className="text-xl font-semibold text-gray-900">Family Tree Builder</h3>
        </div>
        <div className="text-sm text-gray-500">
          {people.length} members, {relationships.length} relationships
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <motion.div
            key={person.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedPerson?.id === person.id
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPerson(person)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {person.first_name} {person.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {person.birth_date ? new Date(person.birth_date).getFullYear() : 'Unknown'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedPerson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 mb-2">
            Selected: {selectedPerson.first_name} {selectedPerson.last_name}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Click on another person to create a relationship, or use the "Add Relationship" button above.
          </p>
          
          {/* Show existing relationships for selected person */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Current Relationships:</p>
            {relationships
              .filter(rel => rel.person1_id === selectedPerson.id || rel.person2_id === selectedPerson.id)
              .map((rel) => {
                const otherPersonId = rel.person1_id === selectedPerson.id ? rel.person2_id : rel.person1_id;
                const otherPerson = people.find(p => p.id === otherPersonId);
                return (
                  <div key={rel.id} className="text-sm text-gray-600">
                    {rel.relationship_type} with {otherPerson?.first_name} {otherPerson?.last_name}
                  </div>
                );
              })}
            {relationships.filter(rel => rel.person1_id === selectedPerson.id || rel.person2_id === selectedPerson.id).length === 0 && (
              <p className="text-sm text-gray-500">No relationships yet</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};