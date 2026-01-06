'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Plus, Users, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const element = document.getElementById('family-tree-container');
      if (!element) {
        throw new Error('Family tree container not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('family-tree.pdf');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </motion.button>
          <div className="text-sm text-gray-500">
            {people.length} members, {relationships.length} relationships
          </div>
        </div>
      </div>

      <div 
        id="family-tree-container"
        className="overflow-auto border border-gray-200 rounded-lg bg-gray-50"
        style={{ 
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
          minHeight: '400px'
        }}
      >
        <div className="p-6" style={{ minWidth: `${100 * (100 / zoom)}%` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person) => (
              <motion.div
                key={person.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all bg-white ${
                  selectedPerson?.id === person.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPerson(person)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    person.gender === 'male' 
                      ? 'bg-blue-500' 
                      : person.gender === 'female'
                      ? 'bg-pink-500'
                      : 'bg-gray-500'
                  }`}>
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {person.first_name} {person.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Born: {person.birth_date ? new Date(person.birth_date).getFullYear() : 'Unknown'}
                    </p>
                    {person.birth_place && (
                      <p className="text-xs text-gray-400">{person.birth_place}</p>
                    )}
                    {person.occupation && (
                      <p className="text-xs text-gray-600">{person.occupation}</p>
                    )}
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Gen 1
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {(() => {
                          const childrenCount = relationships.filter(rel => {
                            if (rel.relationship_type !== 'parent-child') return false;
                            
                            const otherPersonId = rel.person1_id === person.id ? rel.person2_id : rel.person1_id;
                            const otherPerson = people.find(p => p.id === otherPersonId);
                            
                            if (!otherPerson) return false;
                            
                            // Determine who is the parent based on birth dates
                            if (person.birth_date && otherPerson.birth_date) {
                              const personBirthYear = new Date(person.birth_date).getFullYear();
                              const otherPersonBirthYear = new Date(otherPerson.birth_date).getFullYear();
                              
                              // If there's a significant age gap (15+ years), older is parent
                              if (Math.abs(personBirthYear - otherPersonBirthYear) >= 15) {
                                return personBirthYear < otherPersonBirthYear;
                              }
                              
                              // If age gap is small, might be siblings, not parent-child
                              return false;
                            }
                            
                            // If only one person has birth date, assume they are older if born before 1990
                            if (person.birth_date && !otherPerson.birth_date) {
                              return new Date(person.birth_date).getFullYear() < 1990;
                            }
                            
                            if (!person.birth_date && otherPerson.birth_date) {
                              return new Date(otherPerson.birth_date).getFullYear() > 1990;
                            }
                            
                            // If no birth dates available, use position in relationship
                            // In most family tree conventions, person1 is the parent
                            return rel.person1_id === person.id;
                          }).length;
                          
                          return `${childrenCount} ${childrenCount === 1 ? 'child' : 'children'}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Relationship connections visualization */}
          {relationships.length > 0 && (
            <div className="mt-8 p-4 bg-white rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-4">Family Relationships</h4>
              <div className="space-y-2">
                {relationships.map((rel) => {
                  const person1 = people.find(p => p.id === rel.person1_id);
                  const person2 = people.find(p => p.id === rel.person2_id);
                  return (
                    <div key={rel.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        <strong>{person1?.first_name} {person1?.last_name}</strong>
                        {' '} - {rel.relationship_type} - {' '}
                        <strong>{person2?.first_name} {person2?.last_name}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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