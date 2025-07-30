export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Person {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  occupation?: string;
  bio?: string;
  photo_url?: string;
  gender: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  person1_id: string;
  person2_id: string;
  relationship_type: 'parent-child' | 'spouse' | 'sibling';
  created_at: string;
}

export interface RelationshipPath {
  person1: Person;
  person2: Person;
  relationship: string;
  degree: number;
  path: Person[];
}

export interface FamilyTree {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  people: Person[];
}