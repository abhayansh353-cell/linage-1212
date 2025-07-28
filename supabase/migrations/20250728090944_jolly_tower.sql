/*
  # Family Tree Database Schema

  1. New Tables
    - `people`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `birth_date` (date, optional)
      - `death_date` (date, optional)
      - `birth_place` (text, optional)
      - `occupation` (text, optional)
      - `bio` (text, optional)
      - `photo_url` (text, optional)
      - `gender` (text, male/female/other)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `relationships`
      - `id` (uuid, primary key)
      - `person1_id` (uuid, references people)
      - `person2_id` (uuid, references people)
      - `relationship_type` (text, parent-child/spouse/sibling)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own family data
    - Ensure users can only access their own family members and relationships

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize relationship lookups
*/

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  death_date date,
  birth_place text,
  occupation text,
  bio text,
  photo_url text,
  gender text CHECK (gender IN ('male', 'female', 'other')) NOT NULL DEFAULT 'male',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  person2_id uuid REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  relationship_type text CHECK (relationship_type IN ('parent-child', 'spouse', 'sibling')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_people CHECK (person1_id != person2_id),
  CONSTRAINT unique_relationship UNIQUE (person1_id, person2_id, relationship_type)
);

-- Enable Row Level Security
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for people table
CREATE POLICY "Users can view their own family members"
  ON people
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members"
  ON people
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
  ON people
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members"
  ON people
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for relationships table
CREATE POLICY "Users can view relationships involving their family members"
  ON relationships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people p1 WHERE p1.id = person1_id AND p1.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM people p2 WHERE p2.id = person2_id AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert relationships between their family members"
  ON relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people p1 WHERE p1.id = person1_id AND p1.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM people p2 WHERE p2.id = person2_id AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relationships involving their family members"
  ON relationships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people p1 WHERE p1.id = person1_id AND p1.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM people p2 WHERE p2.id = person2_id AND p2.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people p1 WHERE p1.id = person1_id AND p1.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM people p2 WHERE p2.id = person2_id AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships involving their family members"
  ON relationships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM people p1 WHERE p1.id = person1_id AND p1.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM people p2 WHERE p2.id = person2_id AND p2.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for people table
DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();