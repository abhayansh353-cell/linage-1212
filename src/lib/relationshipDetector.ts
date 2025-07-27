import { Person, Relationship, RelationshipPath } from '../types';

export class RelationshipDetector {
  private people: Person[];
  private relationships: Relationship[];
  
  constructor(people: Person[], relationships: Relationship[]) {
    this.people = people;
    this.relationships = relationships;
  }

  // Build adjacency list for the family graph
  private buildFamilyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    this.people.forEach(person => {
      graph.set(person.id, []);
    });

    this.relationships.forEach(rel => {
      const person1Connections = graph.get(rel.person1_id) || [];
      const person2Connections = graph.get(rel.person2_id) || [];
      
      person1Connections.push(rel.person2_id);
      person2Connections.push(rel.person1_id);
      
      graph.set(rel.person1_id, person1Connections);
      graph.set(rel.person2_id, person2Connections);
    });

    return graph;
  }

  // Find shortest path between two people using BFS
  private findPath(person1Id: string, person2Id: string): string[] | null {
    if (person1Id === person2Id) return [person1Id];

    const graph = this.buildFamilyGraph();
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: person1Id, path: [person1Id] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const connections = graph.get(id) || [];
      
      for (const connectionId of connections) {
        if (connectionId === person2Id) {
          return [...path, connectionId];
        }
        
        if (!visited.has(connectionId)) {
          queue.push({ id: connectionId, path: [...path, connectionId] });
        }
      }
    }
    
    return null;
  }

  // Determine relationship type based on path
  private analyzeRelationship(path: string[]): string {
    if (path.length < 2) return 'self';
    if (path.length === 2) return this.getDirectRelationship(path[0], path[1]);
    
    // For longer paths, analyze the relationship chain
    const degree = Math.floor((path.length - 2) / 2);
    
    if (degree === 0) {
      return this.getDirectRelationship(path[0], path[path.length - 1]);
    } else if (degree === 1) {
      return this.isAuntUncleNephewNiece(path) ? 
        `${this.getGender(path[path.length - 1]) === 'male' ? 'nephew' : 'niece'}` :
        'first cousin';
    } else {
      return `${this.ordinal(degree)} cousin`;
    }
  }

  private getDirectRelationship(person1Id: string, person2Id: string): string {
    const relationship = this.relationships.find(rel => 
      (rel.person1_id === person1Id && rel.person2_id === person2Id) ||
      (rel.person1_id === person2Id && rel.person2_id === person1Id)
    );

    if (!relationship) return 'unknown';

    switch (relationship.relationship_type) {
      case 'parent-child':
        return this.isParent(person1Id, person2Id, relationship) ? 'child' : 'parent';
      case 'spouse':
        return 'spouse';
      case 'sibling':
        return 'sibling';
      default:
        return 'unknown';
    }
  }

  private isParent(person1Id: string, person2Id: string, relationship: Relationship): boolean {
    // In parent-child relationships, we need to determine who is the parent
    // This would typically be determined by birth dates or explicit parent field
    const person1 = this.people.find(p => p.id === person1Id);
    const person2 = this.people.find(p => p.id === person2Id);
    
    if (person1?.birth_date && person2?.birth_date) {
      return new Date(person1.birth_date) < new Date(person2.birth_date);
    }
    
    return relationship.person1_id === person1Id;
  }

  private isAuntUncleNephewNiece(path: string[]): boolean {
    // Check if this is an aunt/uncle relationship pattern
    if (path.length !== 3) return false;
    
    const middleRelation1 = this.getDirectRelationship(path[0], path[1]);
    const middleRelation2 = this.getDirectRelationship(path[1], path[2]);
    
    return (middleRelation1 === 'parent' && middleRelation2 === 'sibling') ||
           (middleRelation1 === 'sibling' && middleRelation2 === 'child');
  }

  private getGender(personId: string): string {
    const person = this.people.find(p => p.id === personId);
    return person?.gender || 'other';
  }

  private ordinal(num: number): string {
    const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
    return ordinals[num - 1] || `${num}th`;
  }

  // Main method to detect relationship between two people
  public detectRelationship(person1Id: string, person2Id: string): RelationshipPath | null {
    const person1 = this.people.find(p => p.id === person1Id);
    const person2 = this.people.find(p => p.id === person2Id);
    
    if (!person1 || !person2) return null;
    
    const path = this.findPath(person1Id, person2Id);
    if (!path) return null;
    
    const pathPeople = path.map(id => this.people.find(p => p.id === id)!);
    const relationship = this.analyzeRelationship(path);
    const degree = Math.max(0, path.length - 2);
    
    return {
      person1,
      person2,
      relationship,
      degree,
      path: pathPeople
    };
  }

  // Find all relationships for a specific person
  public findAllRelationships(personId: string): RelationshipPath[] {
    const relationships: RelationshipPath[] = [];
    
    this.people.forEach(person => {
      if (person.id !== personId) {
        const relationship = this.detectRelationship(personId, person.id);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    });
    
    return relationships.sort((a, b) => a.degree - b.degree);
  }
}