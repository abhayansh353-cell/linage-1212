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
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .order('first_name');

      if (error) throw error;
      setPeople(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch people');
    }
  };

  const fetchRelationships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('relationships')
        .select(`
          *,
          person1:people!relationships_person1_id_fkey(user_id),
          person2:people!relationships_person2_id_fkey(user_id)
        `)
        .or(`person1.user_id.eq.${user.id},person2.user_id.eq.${user.id}`);

      if (error) throw error;
      setRelationships(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch relationships');
    }
  };

  const addPerson = async (personData: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('people')
        .insert([{ ...personData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setPeople(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
      throw err;
    }
  };

  const addRelationship = async (person1Id: string, person2Id: string, type: Relationship['relationship_type']) => {
    try {
      const { data, error } = await supabase
        .from('relationships')
        .insert([{
          person1_id: person1Id,
          person2_id: person2Id,
          relationship_type: type
        }])
        .select()
        .single();

      if (error) throw error;
      setRelationships(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
      throw err;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPeople(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPeople(prev => prev.filter(p => p.id !== id));
      setRelationships(prev => prev.filter(r => r.person1_id !== id && r.person2_id !== id));
    } catch (err) {
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
    refetch: () => Promise.all([fetchPeople(), fetchRelationships()])
  };
};