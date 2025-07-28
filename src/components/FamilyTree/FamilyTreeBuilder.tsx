import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Plus, Users, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Person, Relationship } from '../../types';
import { FamilyTreeChart } from './FamilyTreeChart';
import { BulkRelationshipModal } from './BulkRelationshipModal';

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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const exportChart = () => {
    // This would implement chart export functionality
    console.log('Exporting family tree chart...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TreePine className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Family Tree Builder</h2>
              <p className="text-emerald-100">
                Visualize your family connections with an interactive flowchart
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {people.length} Members
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {relationships.length} Connections
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Multiple Relationships</span>
            </motion.button>

            <div className="text-sm text-gray-600">
              Support for 50+ family relationships
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleReset}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={exportChart}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef}
        className="relative h-[600px] overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {people.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Family Members Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Add family members to start building your family tree
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            className="w-full h-full"
          >
            <FamilyTreeChart
              people={people}
              relationships={relationships}
            />
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">{people.length}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{relationships.length}</div>
            <div className="text-sm text-gray-600">Relationships</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(0, Math.ceil(Math.sqrt(people.length)))}
            </div>
            <div className="text-sm text-gray-600">Generations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {new Set(people.map(p => p.last_name)).size}
            </div>
            <div className="text-sm text-gray-600">Family Names</div>
          </div>
        </div>
      </div>

      {/* Bulk Relationship Modal */}
      <BulkRelationshipModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        people={people}
        onAddRelationship={onAddRelationship}
      />
    </motion.div>
  );
};