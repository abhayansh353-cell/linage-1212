import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Users, Heart, Baby, UserCheck } from 'lucide-react';
import { Person, Relationship } from '../../types';

interface RelationshipEntry {
  id: string;
  person1Id: string;
  person2Id: string;
  relationshipType: Relationship['relationship_type'];
}

interface BulkRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onAddRelationship: (person1Id: string, person2Id: string, type: Relationship['relationship_type']) => Promise<void>;
}

const RELATIONSHIP_TYPES = [
  { value: 'parent-child', label: 'Parent-Child', icon: Baby, description: 'Parent to child relationship' },
  { value: 'spouse', label: 'Spouse/Partner', icon: Heart, description: 'Married or partnered' },
  { value: 'sibling', label: 'Sibling', icon: Users, description: 'Brothers and sisters' },
] as const;

const QUICK_TEMPLATES = [
  {
    name: 'Nuclear Family',
    description: 'Parents and their children',
    relationships: [
      { type: 'spouse', person1: 'Parent 1', person2: 'Parent 2' },
      { type: 'parent-child', person1: 'Parent 1', person2: 'Child 1' },
      { type: 'parent-child', person1: 'Parent 2', person2: 'Child 1' },
      { type: 'parent-child', person1: 'Parent 1', person2: 'Child 2' },
      { type: 'parent-child', person1: 'Parent 2', person2: 'Child 2' },
      { type: 'sibling', person1: 'Child 1', person2: 'Child 2' },
    ]
  },
  {
    name: 'Extended Family',
    description: 'Multiple generations with grandparents',
    relationships: [
      { type: 'spouse', person1: 'Grandparent 1', person2: 'Grandparent 2' },
      { type: 'parent-child', person1: 'Grandparent 1', person2: 'Parent 1' },
      { type: 'parent-child', person1: 'Grandparent 2', person2: 'Parent 1' },
      { type: 'spouse', person1: 'Parent 1', person2: 'Parent 2' },
      { type: 'parent-child', person1: 'Parent 1', person2: 'Child 1' },
      { type: 'parent-child', person1: 'Parent 2', person2: 'Child 1' },
    ]
  }
];

export const BulkRelationshipModal: React.FC<BulkRelationshipModalProps> = ({
  isOpen,
  onClose,
  people,
  onAddRelationship
}) => {
  const [relationships, setRelationships] = useState<RelationshipEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'template'>('manual');

  const addRelationship = () => {
    const newRelationship: RelationshipEntry = {
      id: Date.now().toString(),
      person1Id: '',
      person2Id: '',
      relationshipType: 'parent-child'
    };
    setRelationships(prev => [...prev, newRelationship]);
  };

  const removeRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id));
  };

  const updateRelationship = (id: string, field: keyof RelationshipEntry, value: string) => {
    setRelationships(prev => prev.map(rel => 
      rel.id === id ? { ...rel, [field]: value } : rel
    ));
  };

  const handleSubmit = async () => {
    const validRelationships = relationships.filter(rel => 
      rel.person1Id && rel.person2Id && rel.person1Id !== rel.person2Id
    );

    if (validRelationships.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const rel of validRelationships) {
        await onAddRelationship(rel.person1Id, rel.person2Id, rel.relationshipType);
      }
      setRelationships([]);
      onClose();
    } catch (error) {
      console.error('Error adding relationships:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const newRelationships: RelationshipEntry[] = template.relationships.map((rel, index) => ({
      id: `template-${index}`,
      person1Id: '',
      person2Id: '',
      relationshipType: rel.type as Relationship['relationship_type']
    }));
    setRelationships(newRelationships);
    setActiveTab('manual');
  };

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
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
              <div>
                <h2 className="text-2xl font-bold">Bulk Relationship Builder</h2>
                <p className="text-emerald-100">Add multiple family relationships at once</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'template'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quick Templates
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'manual' ? (
                <div className="space-y-6">
                  {/* Relationship Types Guide */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Relationship Types</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {RELATIONSHIP_TYPES.map(({ value, label, icon: Icon, description }) => (
                        <div key={value} className="flex items-center space-x-2 text-sm">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{label}</div>
                            <div className="text-gray-600">{description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Relationship Button */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Relationships ({relationships.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addRelationship}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Relationship</span>
                    </motion.button>
                  </div>

                  {/* Relationships List */}
                  <div className="space-y-4">
                    {relationships.map((relationship, index) => (
                      <motion.div
                        key={relationship.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Relationship #{index + 1}</h4>
                          <button
                            onClick={() => removeRelationship(relationship.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Person
                            </label>
                            <select
                              value={relationship.person1Id}
                              onChange={(e) => updateRelationship(relationship.id, 'person1Id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="">Select person</option>
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
                            <select
                              value={relationship.relationshipType}
                              onChange={(e) => updateRelationship(relationship.id, 'relationshipType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              {RELATIONSHIP_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Second Person
                            </label>
                            <select
                              value={relationship.person2Id}
                              onChange={(e) => updateRelationship(relationship.id, 'person2Id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="">Select person</option>
                              {people.filter(p => p.id !== relationship.person1Id).map((person) => (
                                <option key={person.id} value={person.id}>
                                  {person.first_name} {person.last_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {relationships.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No relationships added yet</p>
                        <p className="text-sm">Click "Add Relationship" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
                    <p className="text-gray-600 mb-6">
                      Choose a template to quickly set up common family structures
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {QUICK_TEMPLATES.map((template, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-emerald-300 transition-all"
                        onClick={() => loadTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <UserCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Includes {template.relationships.length} relationships:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {template.relationships.map((rel, relIndex) => (
                              <span
                                key={relIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {rel.type.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {relationships.length > 0 && (
                  <span>
                    {relationships.filter(r => r.person1Id && r.person2Id && r.person1Id !== r.person2Id).length} valid relationships ready to add
                  </span>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || relationships.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Adding Relationships...' : `Add ${relationships.filter(r => r.person1Id && r.person2Id && r.person1Id !== r.person2Id).length} Relationships`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};