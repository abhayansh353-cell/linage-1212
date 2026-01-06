'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Plus, Users, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Person, Relationship } from '../../types';
import { HierarchicalTreeView } from './HierarchicalTreeView';

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
        className="overflow-auto border border-gray-200 rounded-lg bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"
        style={{ 
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          minHeight: '500px'
        }}
      >
        <HierarchicalTreeView people={people} relationships={relationships} />
      </div>
    </div>
  );
};