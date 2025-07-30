'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Person, Relationship } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const usePeople = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = async () => {
    if (!user) return;

    try {
      console.log('Fetching people for user:', user.id);
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .order('first_name');

      if (error) {
        console.error('Error fetching people:', error);
        throw error;
      }
      console.log('Fetched people:', data);
      setPeople(data || []);
    } catch (err) {
      console.error('Error in fetchPeople:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch people');
    }
  };

  const fetchRelationships = async () => {
    if (!user) return;

    try {
      console.log('Fetching relationships for user:', user.id);
      // First get all relationships where either person belongs to the current user
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('relationships')
        .select('*');

      if (relationshipError) {
        console.error('Error fetching relationships:', relationshipError);
        throw relationshipError;
      }

      // Filter relationships to only include those where both people belong to the current user
      if (relationshipData) {
        const userPeopleIds = people.map(p => p.id);
        const filteredRelationships = relationshipData.filter(rel => 
          userPeopleIds.includes(rel.person1_id) && userPeopleIds.includes(rel.person2_id)
        );
        console.log('Filtered relationships:', filteredRelationships);
        setRelationships(filteredRelationships);
      } else {
        setRelationships([]);
      }
    } catch (err) {
      console.error('Error in fetchRelationships:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch relationships');
    }
  };

  const addPerson = async (personData: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      console.error('No user found when trying to add person');
      throw new Error('User not authenticated');
    }

    try {
      console.log('Adding person with data:', personData);
      
      // Clean the data before inserting - convert empty strings to null
      const cleanData = {
        ...personData,
        user_id: user.id,
        birth_date: personData.birth_date || null,
        death_date: personData.death_date || null,
        birth_place: personData.birth_place || null,
        occupation: personData.occupation || null,
        bio: personData.bio || null,
        photo_url: personData.photo_url || null
      };

      console.log('Clean data for insertion:', cleanData);

      const { data, error } = await supabase
        .from('people')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding person:', error);
        throw error;
      }
      
      console.log('Successfully added person:', data);
      setPeople(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding person:', err);
      setError(err instanceof Error ? err.message : 'Failed to add person');
      throw err;
    }
  };

  const addRelationship = async (person1Id: string, person2Id: string, type: Relationship['relationship_type']) => {
    try {
      console.log('Adding relationship:', { person1Id, person2Id, type });
      
      // Validate that both people exist and belong to the current user
      const person1 = people.find(p => p.id === person1Id);
      const person2 = people.find(p => p.id === person2Id);
      
      if (!person1 || !person2) {
        console.error('One or both people not found:', { person1: !!person1, person2: !!person2 });
        throw new Error('One or both people not found');
      }
      
      // Check if relationship already exists (bidirectional)
      const existingRelationship = relationships.find(rel => 
        (rel.person1_id === person1Id && rel.person2_id === person2Id && rel.relationship_type === type) ||
        (rel.person1_id === person2Id && rel.person2_id === person1Id && rel.relationship_type === type)
      );
      
      if (existingRelationship) {
        console.error('Relationship already exists:', existingRelationship);
        throw new Error('This relationship already exists');
      }
      
      const { data, error } = await supabase
        .from('relationships')
        .insert([{
          person1_id: person1Id,
          person2_id: person2Id,
          relationship_type: type
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding relationship:', error);
        throw error;
      }
      
      console.log('Relationship added successfully:', data);
      setRelationships(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding relationship:', err);
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
      throw err;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      console.log('Updating person:', id, updates);
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating person:', error);
        throw error;
      }
      
      console.log('Person updated successfully:', data);
      setPeople(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Error updating person:', err);
      setError(err instanceof Error ? err.message : 'Failed to update person');
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      console.log('Deleting person:', id);
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting person:', error);
        throw error;
      }
      
      console.log('Person deleted successfully');
      setPeople(prev => prev.filter(p => p.id !== id));
      setRelationships(prev => prev.filter(r => r.person1_id !== id && r.person2_id !== id));
    } catch (err) {
      console.error('Error deleting person:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete person');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchPeople(), fetchRelationships()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    people,
    relationships,
    loading,
    error,
    addPerson,
    addRelationship,
    updatePerson,
    deletePerson,
    refetch: async () => {
      await fetchPeople();
      await fetchRelationships();
    }
  };
};