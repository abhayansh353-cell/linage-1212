'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Baby } from 'lucide-react';
import { Person, Relationship } from '../../types';

interface TreeNode {
  person: Person;
  children: TreeNode[];
  spouse?: Person;
  level: number;
}

interface HierarchicalTreeViewProps {
  people: Person[];
  relationships: Relationship[];
}

export const HierarchicalTreeView: React.FC<HierarchicalTreeViewProps> = ({
  people,
  relationships
}) => {
  // Build the family tree structure
  const familyTree = useMemo(() => {
    if (people.length === 0) return [];

    // Find parent-child relationships
    const parentChildRels = relationships.filter(r => r.relationship_type === 'parent-child');
    const spouseRels = relationships.filter(r => r.relationship_type === 'spouse');

    // Create a map of person to their children
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string[]>();
    
    parentChildRels.forEach(rel => {
      const person1 = people.find(p => p.id === rel.person1_id);
      const person2 = people.find(p => p.id === rel.person2_id);
      
      if (!person1 || !person2) return;
      
      // Determine parent and child based on birth dates
      let parentId: string, childId: string;
      
      if (person1.birth_date && person2.birth_date) {
        const year1 = new Date(person1.birth_date).getFullYear();
        const year2 = new Date(person2.birth_date).getFullYear();
        
        if (year1 < year2 - 10) {
          parentId = rel.person1_id;
          childId = rel.person2_id;
        } else if (year2 < year1 - 10) {
          parentId = rel.person2_id;
          childId = rel.person1_id;
        } else {
          // Age difference too small, use relationship direction
          parentId = rel.person1_id;
          childId = rel.person2_id;
        }
      } else {
        // No birth dates, assume person1 is parent
        parentId = rel.person1_id;
        childId = rel.person2_id;
      }
      
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(childId);
      
      if (!parentMap.has(childId)) {
        parentMap.set(childId, []);
      }
      parentMap.get(childId)!.push(parentId);
    });

    // Create a set of people who are spouses (they'll be shown alongside their partner)
    const spouseIds = new Set<string>();
    spouseRels.forEach(rel => {
      // Find which spouse is a parent (has children)
      const person1HasChildren = childrenMap.has(rel.person1_id);
      const person2HasChildren = childrenMap.has(rel.person2_id);
      
      if (person1HasChildren && !person2HasChildren) {
        // person1 is the main parent, person2 is the spouse shown alongside
        spouseIds.add(rel.person2_id);
      } else if (person2HasChildren && !person1HasChildren) {
        // person2 is the main parent, person1 is the spouse shown alongside
        spouseIds.add(rel.person1_id);
      } else if (person1HasChildren && person2HasChildren) {
        // Both have children, pick one to be the main (e.g., older one or male)
        const person1 = people.find(p => p.id === rel.person1_id);
        const person2 = people.find(p => p.id === rel.person2_id);
        if (person1 && person2) {
          if (person1.gender === 'male') {
            spouseIds.add(rel.person2_id);
          } else {
            spouseIds.add(rel.person1_id);
          }
        }
      } else {
        // Neither has children - mark one as spouse to avoid duplicate display
        const person1 = people.find(p => p.id === rel.person1_id);
        if (person1 && person1.gender === 'male') {
          spouseIds.add(rel.person2_id);
        } else {
          spouseIds.add(rel.person1_id);
        }
      }
    });

    // Find root nodes (people with no parents and not a spouse who will be shown alongside their partner)
    const rootIds = people
      .filter(p => !parentMap.has(p.id) && !spouseIds.has(p.id))
      .map(p => p.id);

    // If no clear roots, pick the oldest people as roots
    if (rootIds.length === 0 && people.length > 0) {
      const sorted = [...people].sort((a, b) => {
        if (!a.birth_date) return 1;
        if (!b.birth_date) return -1;
        return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
      });
      rootIds.push(sorted[0].id);
    }

    // Build tree recursively
    const buildTree = (personId: string, level: number, visited: Set<string>): TreeNode | null => {
      if (visited.has(personId)) return null;
      visited.add(personId);

      const person = people.find(p => p.id === personId);
      if (!person) return null;

      // Find spouse
      const spouseRel = spouseRels.find(r => 
        r.person1_id === personId || r.person2_id === personId
      );
      let spouse: Person | undefined;
      if (spouseRel) {
        const spouseId = spouseRel.person1_id === personId ? spouseRel.person2_id : spouseRel.person1_id;
        spouse = people.find(p => p.id === spouseId);
      }

      // Build children
      const childIds = childrenMap.get(personId) || [];
      const children = childIds
        .map(childId => buildTree(childId, level + 1, visited))
        .filter((node): node is TreeNode => node !== null);

      return {
        person,
        spouse,
        children,
        level
      };
    };

    const visited = new Set<string>();
    return rootIds
      .map(rootId => buildTree(rootId, 0, visited))
      .filter((node): node is TreeNode => node !== null);
  }, [people, relationships]);

  const renderNode = (node: TreeNode, index: number) => {
    return (
      <div key={node.person.id} className="flex flex-col items-center">
        {/* Person and Spouse Cards */}
        <div className="flex items-center gap-4 mb-8">
          {/* Main Person Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className={`bg-white border-2 rounded-lg shadow-lg p-4 min-w-[200px] ${
              node.person.gender === 'male' 
                ? 'border-blue-400' 
                : node.person.gender === 'female'
                ? 'border-pink-400'
                : 'border-gray-400'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  node.person.gender === 'male' 
                    ? 'bg-blue-500' 
                    : node.person.gender === 'female'
                    ? 'bg-pink-500'
                    : 'bg-gray-500'
                }`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {node.person.first_name} {node.person.last_name}
                  </p>
                  {node.person.birth_date && (
                    <p className="text-xs text-gray-600">
                      b. {new Date(node.person.birth_date).getFullYear()}
                      {node.person.death_date && ` - d. ${new Date(node.person.death_date).getFullYear()}`}
                    </p>
                  )}
                </div>
              </div>
              {node.person.occupation && (
                <p className="text-xs text-gray-500 mt-1">{node.person.occupation}</p>
              )}
              {node.person.birth_place && (
                <p className="text-xs text-gray-400 mt-1">📍 {node.person.birth_place}</p>
              )}
            </div>
          </motion.div>

          {/* Spouse Connection */}
          {node.spouse && (
            <>
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.05 }}
              >
                <div className={`bg-white border-2 rounded-lg shadow-lg p-4 min-w-[200px] ${
                  node.spouse.gender === 'male' 
                    ? 'border-blue-400' 
                    : node.spouse.gender === 'female'
                    ? 'border-pink-400'
                    : 'border-gray-400'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      node.spouse.gender === 'male' 
                        ? 'bg-blue-500' 
                        : node.spouse.gender === 'female'
                        ? 'bg-pink-500'
                        : 'bg-gray-500'
                    }`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {node.spouse.first_name} {node.spouse.last_name}
                      </p>
                      {node.spouse.birth_date && (
                        <p className="text-xs text-gray-600">
                          b. {new Date(node.spouse.birth_date).getFullYear()}
                          {node.spouse.death_date && ` - d. ${new Date(node.spouse.death_date).getFullYear()}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {node.spouse.occupation && (
                    <p className="text-xs text-gray-500 mt-1">{node.spouse.occupation}</p>
                  )}
                  {node.spouse.birth_place && (
                    <p className="text-xs text-gray-400 mt-1">📍 {node.spouse.birth_place}</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Children Connection Line */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Vertical line down */}
            <div className="w-0.5 h-8 bg-emerald-500"></div>
            
            {/* Horizontal line across children */}
            {node.children.length > 1 && (
              <div className="relative w-full flex justify-center">
                <div className="absolute top-0 h-0.5 bg-emerald-500" style={{ 
                  width: `${Math.min(node.children.length * 220, 1000)}px` 
                }}></div>
              </div>
            )}

            {/* Children Container */}
            <div className={`flex gap-8 mt-8 ${node.children.length > 1 ? 'pt-8' : ''}`}>
              {node.children.map((child, childIndex) => (
                <div key={child.person.id} className="relative">
                  {/* Vertical line to child */}
                  {node.children.length > 1 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-emerald-500"></div>
                  )}
                  {renderNode(child, index + childIndex + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Add family members to see your family tree</p>
      </div>
    );
  }

  if (familyTree.length === 0) {
    return (
      <div className="text-center py-12">
        <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Add relationships to build your family tree</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto pb-8">
      <div className="inline-flex flex-col gap-12 p-8 min-w-full justify-center items-center">
        {familyTree.map((root, index) => renderNode(root, index))}
      </div>
    </div>
  );
};
