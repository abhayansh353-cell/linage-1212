import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Search, BarChart3, Link, X } from 'lucide-react';
import { PersonCard } from '../Family/PersonCard';
import { AddPersonModal } from '../Family/AddPersonModal';
import { RelationshipModal } from '../Family/RelationshipModal';
import { FamilyTreeBuilder } from '../FamilyTree/FamilyTreeBuilder';
import { usePeople } from '../../hooks/usePeople';
import { Person } from '../../types';
import { RelationshipDetector } from '../../lib/relationshipDetector';

export const Dashboard: React.FC = () => {
  const { people, relationships, loading, error, addPerson, addRelationship, updatePerson, deletePerson } = usePeople();
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = people.filter(person =>
    `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.birth_place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPerson = async (personData: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await addPerson(personData);
    } catch (error) {
      console.error('Failed to add person:', error);
      alert('Failed to add person. Please check your Supabase configuration and try again.');
    }
  };

  const handleUpdatePerson = async (personData: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingPerson) {
      await updatePerson(editingPerson.id, personData);
      setEditingPerson(null);
    }
  };

  const handleDeletePerson = async (person: Person) => {
    if (window.confirm(`Are you sure you want to delete ${person.first_name} ${person.last_name}?`)) {
      await deletePerson(person.id);
    }
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const getRelationshipsForPerson = (person: Person) => {
    if (!people.length || !relationships.length) return [];
    
    const detector = new RelationshipDetector(people, relationships);
    return detector.findAllRelationships(person.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Family Members</p>
                <p className="text-3xl font-bold text-gray-900">{people.length}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Relationships</p>
                <p className="text-3xl font-bold text-gray-900">{relationships.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Generation Depth</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.max(0, Math.ceil(Math.sqrt(people.length)))}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search family members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRelationshipModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Link className="h-4 w-4" />
              <span>Add Relationship</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddPersonModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Person</span>
            </motion.button>
          </div>
        </div>

        {/* Family Members Grid */}
        {filteredPeople.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {people.length === 0 ? 'Start Building Your Family Tree' : 'No matching family members found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {people.length === 0 
                ? 'Add your first family member to begin creating your lineage'
                : 'Try adjusting your search terms'
              }
            </p>
            {people.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddPersonModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                Add First Family Member
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPeople.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PersonCard
                  person={person}
                  onEdit={setEditingPerson}
                  onDelete={handleDeletePerson}
                  onClick={handlePersonClick}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Family Tree Builder */}
        <div className="mt-12">
          <FamilyTreeBuilder
            people={people}
            relationships={relationships}
            onAddRelationship={addRelationship}
          />
        </div>

        {/* Selected Person Details */}
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Relationships for {selectedPerson.first_name} {selectedPerson.last_name}
              </h3>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {getRelationshipsForPerson(selectedPerson).map((rel, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {rel.person2.first_name} {rel.person2.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {rel.relationship}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {rel.degree === 0 ? 'Direct' : `${rel.degree} degrees`}
                    </p>
                  </div>
                </div>
              ))}
              
              {getRelationshipsForPerson(selectedPerson).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No relationships found. Add some relationships to see connections.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        onSubmit={handleAddPerson}
        title="Add Family Member"
      />

      <AddPersonModal
        isOpen={!!editingPerson}
        onClose={() => setEditingPerson(null)}
        onSubmit={handleUpdatePerson}
        person={editingPerson || undefined}
        title="Edit Family Member"
      />

      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        people={people}
        onAddRelationship={addRelationship}
      />
    </div>
  );
};