-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS student_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS user_schools CASCADE;
DROP TABLE IF EXISTS pending_users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;

-- Create users table (syncs with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schools table for multi-tenancy
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  admin_user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  plan_type TEXT DEFAULT 'BASIC' CHECK (plan_type IN ('BASIC', 'PRO', 'ENTERPRISE')),
  max_users INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_schools junction table for role-based access
CREATE TABLE IF NOT EXISTS user_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- Create pending_users table for invitations
CREATE TABLE IF NOT EXISTS pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  
  -- Teacher-specific fields
  subject_areas TEXT[],
  qualifications TEXT,
  experience_years INTEGER,
  
  -- Student-specific fields
  grade_level TEXT,
  parent_email TEXT,
  date_of_birth DATE,
  
  -- Invitation fields
  invitation_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  
  UNIQUE(school_id, email)
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT,
  teacher_id UUID REFERENCES users(id),
  max_students INTEGER DEFAULT 30,
  schedule TEXT, -- JSON string for class schedule
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(student_id, class_id)
);

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  subject_areas TEXT[] NOT NULL,
  qualifications TEXT,
  experience_years INTEGER,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  grade_level TEXT NOT NULL,
  parent_email TEXT,
  date_of_birth DATE,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_id = current_setting('app.current_user_id', true));

-- RLS Policies for schools table
CREATE POLICY "Users can view schools they belong to" ON schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
    )
  );

CREATE POLICY "Admins can manage their schools" ON schools
  FOR ALL USING (
    admin_user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
  );

-- RLS Policies for user_schools table
CREATE POLICY "Users can view their school memberships" ON user_schools
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Admins can manage school memberships" ON user_schools
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
      AND role = 'admin'
    )
  );

-- RLS Policies for pending_users table
CREATE POLICY "Admins can manage pending users in their schools" ON pending_users
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view pending users in their schools" ON pending_users
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
    )
  );

-- RLS Policies for classes table
CREATE POLICY "Users can view classes in their schools" ON classes
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
    )
  );

CREATE POLICY "Teachers can manage their classes" ON classes
  FOR ALL USING (
    teacher_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
  );

-- RLS Policies for student_enrollments table
CREATE POLICY "Users can view enrollments in their schools" ON student_enrollments
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id IN (
        SELECT school_id FROM user_schools 
        WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
      )
    )
  );

-- RLS Policies for teacher_profiles table
CREATE POLICY "Users can view teacher profiles in their schools" ON teacher_profiles
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
    )
  );

CREATE POLICY "Teachers can manage their own profile" ON teacher_profiles
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
  );

-- RLS Policies for student_profiles table
CREATE POLICY "Users can view student profiles in their schools" ON student_profiles
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
    )
  );

CREATE POLICY "Students can manage their own profile" ON student_profiles
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.current_user_id', true))
  );

-- Insert sample data for testing
INSERT INTO users (clerk_id, email, first_name, last_name) 
VALUES ('sample_clerk_id', 'admin@school.com', 'John', 'Admin')
ON CONFLICT (clerk_id) DO NOTHING;

INSERT INTO schools (name, subdomain, description, admin_user_id, plan_type, max_users)
SELECT 'Sample School', 'sample', 'A sample school for testing', id, 'BASIC', 100
FROM users WHERE clerk_id = 'sample_clerk_id'
ON CONFLICT (subdomain) DO NOTHING;