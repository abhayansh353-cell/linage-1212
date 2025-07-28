import React, { useMemo } from 'react';
import { Person, Relationship } from '../../types';
import { User, Heart, Users, Baby } from 'lucide-react';

interface FamilyTreeChartProps {
  people: Person[];
  relationships: Relationship[];
}

interface TreeNode {
  person: Person;
  x: number;
  y: number;
  level: number;
  children: TreeNode[];
  parents: TreeNode[];
}

export const FamilyTreeChart: React.FC<FamilyTreeChartProps> = ({
  people,
  relationships
}) => {
  const treeData = useMemo(() => {
    if (people.length === 0) return { nodes: [], connections: [] };

    // Build relationship map
    const relationshipMap = new Map<string, { person: Person; type: string }[]>();
    
    people.forEach(person => {
      relationshipMap.set(person.id, []);
    });

    relationships.forEach(rel => {
      const person1Rels = relationshipMap.get(rel.person1_id) || [];
      const person2Rels = relationshipMap.get(rel.person2_id) || [];
      
      const person1 = people.find(p => p.id === rel.person1_id);
      const person2 = people.find(p => p.id === rel.person2_id);
      
      if (person1 && person2) {
        person1Rels.push({ person: person2, type: rel.relationship_type });
        person2Rels.push({ person: person1, type: rel.relationship_type });
        
        relationshipMap.set(rel.person1_id, person1Rels);
        relationshipMap.set(rel.person2_id, person2Rels);
      }
    });

    // Create tree layout
    const nodes: TreeNode[] = [];
    const processed = new Set<string>();
    
    // Find root nodes (people with no parents or oldest people)
    const rootCandidates = people.filter(person => {
      const rels = relationshipMap.get(person.id) || [];
      const hasParents = rels.some(rel => rel.type === 'parent-child');
      return !hasParents;
    });

    const roots = rootCandidates.length > 0 ? rootCandidates : [people[0]];
    
    // Layout algorithm
    const nodeWidth = 200;
    const nodeHeight = 120;
    const levelHeight = 150;
    const siblingSpacing = 220;
    
    let currentX = 0;
    
    const createNode = (person: Person, level: number, parentX?: number): TreeNode => {
      if (processed.has(person.id)) {
        return nodes.find(n => n.person.id === person.id)!;
      }
      
      const x = parentX !== undefined ? parentX : currentX;
      const y = level * levelHeight + 50;
      
      const node: TreeNode = {
        person,
        x,
        y,
        level,
        children: [],
        parents: []
      };
      
      nodes.push(node);
      processed.add(person.id);
      
      // Add children
      const rels = relationshipMap.get(person.id) || [];
      const children = rels.filter(rel => rel.type === 'parent-child').map(rel => rel.person);
      
      children.forEach((child, index) => {
        const childX = x + (index - (children.length - 1) / 2) * siblingSpacing;
        const childNode = createNode(child, level + 1, childX);
        node.children.push(childNode);
        childNode.parents.push(node);
      });
      
      if (parentX === undefined) {
        currentX += siblingSpacing;
      }
      
      return node;
    };
    
    // Create tree starting from roots
    roots.forEach(root => {
      createNode(root, 0);
    });
    
    // Create connections
    const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      type: string;
    }> = [];
    
    relationships.forEach(rel => {
      const person1Node = nodes.find(n => n.person.id === rel.person1_id);
      const person2Node = nodes.find(n => n.person.id === rel.person2_id);
      
      if (person1Node && person2Node) {
        connections.push({
          from: { x: person1Node.x + nodeWidth / 2, y: person1Node.y + nodeHeight / 2 },
          to: { x: person2Node.x + nodeWidth / 2, y: person2Node.y + nodeHeight / 2 },
          type: rel.relationship_type
        });
      }
    });
    
    return { nodes, connections };
  }, [people, relationships]);

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'parent-child': return Baby;
      case 'spouse': return Heart;
      case 'sibling': return Users;
      default: return User;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'parent-child': return '#10b981'; // emerald
      case 'spouse': return '#ef4444'; // red
      case 'sibling': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  if (treeData.nodes.length === 0) {
    return null;
  }

  // Calculate SVG dimensions
  const minX = Math.min(...treeData.nodes.map(n => n.x)) - 100;
  const maxX = Math.max(...treeData.nodes.map(n => n.x)) + 300;
  const minY = Math.min(...treeData.nodes.map(n => n.y)) - 50;
  const maxY = Math.max(...treeData.nodes.map(n => n.y)) + 170;

  return (
    <div className="w-full h-full relative">
      <svg
        width={maxX - minX}
        height={maxY - minY}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="absolute inset-0"
      >
        {/* Connections */}
        {treeData.connections.map((connection, index) => {
          const Icon = getRelationshipIcon(connection.type);
          const color = getRelationshipColor(connection.type);
          const midX = (connection.from.x + connection.to.x) / 2;
          const midY = (connection.from.y + connection.to.y) / 2;
          
          return (
            <g key={index}>
              <line
                x1={connection.from.x}
                y1={connection.from.y}
                x2={connection.to.x}
                y2={connection.to.y}
                stroke={color}
                strokeWidth="2"
                strokeDasharray={connection.type === 'spouse' ? '5,5' : 'none'}
              />
              <circle
                cx={midX}
                cy={midY}
                r="12"
                fill="white"
                stroke={color}
                strokeWidth="2"
              />
              <foreignObject
                x={midX - 8}
                y={midY - 8}
                width="16"
                height="16"
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {treeData.nodes.map((node) => (
        <div
          key={node.person.id}
          className="absolute bg-white rounded-lg shadow-lg border-2 border-gray-200 hover:border-emerald-400 transition-all duration-200 cursor-pointer"
          style={{
            left: node.x,
            top: node.y,
            width: 200,
            height: 120,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="p-3 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                node.person.gender === 'male' 
                  ? 'bg-blue-100 text-blue-600' 
                  : node.person.gender === 'female'
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {node.person.first_name} {node.person.last_name}
                </h4>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1 flex-1">
              {node.person.birth_date && (
                <div>Born: {new Date(node.person.birth_date).getFullYear()}</div>
              )}
              {node.person.birth_place && (
                <div className="truncate">{node.person.birth_place}</div>
              )}
              {node.person.occupation && (
                <div className="truncate">{node.person.occupation}</div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Gen {node.level + 1}</span>
              <span>{node.children.length} children</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};