-- Fix RLS policies to allow user creation and better authentication
-- This file contains updated RLS policies that work with Clerk authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view schools they belong to" ON schools;
DROP POLICY IF EXISTS "Admins can manage their schools" ON schools;
DROP POLICY IF EXISTS "Users can view their school memberships" ON user_schools;
DROP POLICY IF EXISTS "Admins can manage school memberships" ON user_schools;
DROP POLICY IF EXISTS "Admins can manage pending users in their schools" ON pending_users;
DROP POLICY IF EXISTS "Users can view pending users in their schools" ON pending_users;
DROP POLICY IF EXISTS "Users can view classes in their schools" ON classes;
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
DROP POLICY IF EXISTS "Users can view enrollments in their schools" ON student_enrollments;
DROP POLICY IF EXISTS "Users can view teacher profiles in their schools" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can manage their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Users can view student profiles in their schools" ON student_profiles;
DROP POLICY IF EXISTS "Students can manage their own profile" ON student_profiles;

-- Create function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user clerk ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_clerk_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'clerk_id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    clerk_id = get_current_user_clerk_id() OR 
    clerk_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    clerk_id = get_current_user_clerk_id() OR 
    clerk_id = current_setting('app.current_user_id', true)
  );

-- Allow user creation (this is needed for new users)
CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (true);

-- Updated RLS Policies for schools table
CREATE POLICY "Users can view schools they belong to" ON schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
    )
  );

CREATE POLICY "Admins can manage their schools" ON schools
  FOR ALL USING (
    admin_user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
  );

-- Updated RLS Policies for user_schools table
CREATE POLICY "Users can view their school memberships" ON user_schools
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
  );

CREATE POLICY "Admins can manage school memberships" ON user_schools
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
      AND role = 'admin'
    )
  );

-- Updated RLS Policies for pending_users table
CREATE POLICY "Admins can manage pending users in their schools" ON pending_users
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view pending users in their schools" ON pending_users
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
    )
  );

-- Updated RLS Policies for classes table
CREATE POLICY "Users can view classes in their schools" ON classes
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
    )
  );

CREATE POLICY "Teachers can manage their classes" ON classes
  FOR ALL USING (
    teacher_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
  );

-- Updated RLS Policies for student_enrollments table
CREATE POLICY "Users can view enrollments in their schools" ON student_enrollments
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id IN (
        SELECT school_id FROM user_schools 
        WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
      )
    )
  );

-- Updated RLS Policies for teacher_profiles table
CREATE POLICY "Users can view teacher profiles in their schools" ON teacher_profiles
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
    )
  );

CREATE POLICY "Teachers can manage their own profile" ON teacher_profiles
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
  );

-- Updated RLS Policies for student_profiles table
CREATE POLICY "Users can view student profiles in their schools" ON student_profiles
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_schools 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
    )
  );

CREATE POLICY "Students can manage their own profile" ON student_profiles
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = get_current_user_clerk_id())
  );
