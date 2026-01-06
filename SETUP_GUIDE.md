# Family Tree Application - Setup Guide

## ✅ What's Been Implemented

I've successfully added an **automatic hierarchical family tree visualization** that creates a beautiful tree diagram when you add family members and their relationships!

### New Features:
- 🌳 **Hierarchical Tree View**: Family members are now displayed in a traditional tree structure
- 👨‍👩‍👧‍👦 **Parent-Child Connections**: Visual lines connect parents to their children
- 💕 **Spouse Display**: Married couples are shown side-by-side with heart icons
- 🎨 **Color-Coded**: Blue for males, pink for females, gray for other
- 📊 **Generation Levels**: Automatically organizes family by generation
- 🔍 **Zoom Controls**: Zoom in/out to view large family trees
- 📥 **PDF Export**: Export your beautiful family tree to PDF

## 🚀 How to Use the Family Tree

### Step 1: Sign Up / Log In
1. Open the application (running on port 3000)
2. Create an account or log in

### Step 2: Add Family Members
1. Click the **"Add Person"** button
2. Fill in details:
   - Name
   - Birth date (important for determining parent-child relationships!)
   - Birth place
   - Occupation
   - Gender
   - Biography
   - Photo (optional)

### Step 3: Create Relationships
1. Click **"Add Relationship"** button
2. Select two family members
3. Choose relationship type:
   - **Parent-Child**: For parent and their children
   - **Spouse**: For married couples
   - **Sibling**: For brothers and sisters

### Step 4: View Your Family Tree
- Scroll down to the "Family Tree Builder" section
- The tree will **automatically generate** showing:
  - Oldest generation at the top
  - Children below their parents
  - Spouses next to each other
  - Connecting lines showing relationships

### Step 5: Export (Optional)
- Click the **"Export"** button to save your family tree as a PDF

## ⚙️ Supabase Setup (Required for Full Functionality)

The app currently uses placeholder Supabase credentials. To enable database functionality:

### Option 1: Use Existing Supabase Project
If you have a Supabase project:
1. Go to your Supabase dashboard
2. Copy your project URL and anon key
3. Update `/app/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```
4. Restart the app: `sudo supervisorctl restart nextjs`

### Option 2: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Run the migration SQL from `/app/supabase/migrations/20250728090944_jolly_tower.sql` in the SQL editor
5. Get your project URL and anon key from Settings > API
6. Update `/app/.env.local` with your credentials
7. Restart: `sudo supervisorctl restart nextjs`

## 📁 Project Structure

```
/app/
├── app/
│   ├── components/
│   │   ├── FamilyTree/
│   │   │   ├── FamilyTreeBuilder.tsx       # Main tree component
│   │   │   └── HierarchicalTreeView.tsx    # NEW: Tree visualization
│   │   ├── Family/                          # Person & relationship modals
│   │   ├── Dashboard/                       # Main dashboard
│   │   └── Auth/                            # Login/signup
│   ├── hooks/
│   │   └── usePeople.ts                     # Data management
│   └── lib/
│       ├── supabase.ts                      # Database client
│       └── relationshipDetector.ts          # Relationship logic
├── supabase/
│   └── migrations/                          # Database schema
└── .env.local                               # Configuration

```

## 🎯 How the Tree Generation Works

1. **Automatic Generation**: When you add relationships, the tree automatically updates
2. **Smart Hierarchy**: Uses birth dates to determine generations
3. **Root Detection**: Finds the oldest family members as tree roots
4. **Branch Organization**: Groups children under parents with visual connectors
5. **Spouse Pairing**: Shows married couples together with heart icon

## 🐛 Troubleshooting

### Tree Not Showing?
- Make sure you've added at least 2 family members
- Add at least one relationship between them
- Check that birth dates are filled in (helps determine generations)

### Wrong Hierarchy?
- Verify birth dates are correct (parent should be 15+ years older than child)
- Make sure you selected "Parent-Child" relationship (not sibling)

### Data Not Saving?
- You need to set up Supabase (see setup section above)
- Check browser console for errors

## 📱 App Status

- ✅ Next.js server running on port 3000
- ✅ Hot reload enabled (changes auto-update)
- ✅ Family tree visualization implemented
- ⚠️  Supabase needs configuration for data persistence

## 🎨 Customization

The tree colors and styling can be customized in:
- `/app/app/components/FamilyTree/HierarchicalTreeView.tsx`

Border colors:
- Blue = Male
- Pink = Female
- Gray = Other/Unspecified

## 🚀 Next Steps

1. Set up your Supabase account
2. Add your family members
3. Create relationships
4. Watch your family tree grow automatically!

---

**Need Help?** Check the logs: `tail -f /var/log/supervisor/nextjs.out.log`
