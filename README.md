# Family Tree Application

A beautiful, modern family tree application built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure email/password authentication
- **Family Member Management**: Add, edit, and delete family members
- **Relationship Tracking**: Define relationships between family members (parent-child, spouse, sibling)
- **Relationship Detection**: Automatically detect complex relationships (cousins, aunts, uncles, etc.)
- **Search & Filter**: Find family members by name, location, or occupation
- **Responsive Design**: Beautiful UI that works on all devices
- **Photo Support**: Add photos to family member profiles

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be fully set up

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Database Migrations

The database schema will be automatically created when you first connect to Supabase. The migration includes:

- `people` table for storing family member information
- `relationships` table for storing connections between family members
- Row Level Security (RLS) policies to ensure data privacy
- Indexes for optimal performance

### 5. Start the Application

```bash
npm install
npm run dev
```

## Database Schema

### People Table
- Personal information (name, birth/death dates, location, occupation)
- Biography and photo support
- User ownership for data privacy

### Relationships Table
- Connects two people with a relationship type
- Supports parent-child, spouse, and sibling relationships
- Automatic relationship detection for complex family connections

## Security

- Row Level Security ensures users can only access their own family data
- Secure authentication with Supabase Auth
- All database operations are protected by user-specific policies

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details