import { supabase } from './supabase';

export interface School {
    id: string;
    name: string;
    subdomain: string;
    description: string;
    logo_url: string | null;
    primary_color: string;
    admin_user_id: string;
    status: 'active' | 'inactive' | 'suspended';
    plan_type: 'BASIC' | 'PRO' | 'ENTERPRISE';
    max_users: number;
    created_at: string;
    updated_at: string;
    user_count?: number;
    class_count?: number;
}

export interface CreateSchoolData {
    name: string;
    subdomain: string;
    description: string;
    planType: 'BASIC' | 'PRO' | 'ENTERPRISE';
    maxUsers: number;
}

export async function getCurrentUser(clerkId: string, supabaseClient?: any) {
    if (!clerkId) {
        console.error('No clerk ID provided');
        return null;
    }

    console.log('Getting current user for clerk ID:', clerkId);

    const client = supabaseClient || supabase;
    console.log('Using client:', client ? 'Custom client' : 'Default client');

    // Try to get the user directly without connection test
    try {
        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('clerk_id', clerkId)
            .single();

        console.log('Query result - data:', data, 'error:', error);

        if (error) {
            console.error('Error fetching user:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception fetching user:', err);
        return null;
    }
}

export async function createUserIfNotExists(clerkId: string, userData: any, supabaseClient?: any) {
    if (!clerkId) {
        console.error('No clerk ID provided');
        return null;
    }

    console.log('Creating user if not exists for clerk ID:', clerkId);
    console.log('User data:', userData);

    const client = supabaseClient || supabase;
    console.log('Using client for user creation:', client ? 'Clerk client' : 'Default client');

    // First try to get existing user using the default supabase client to avoid RLS issues
    try {
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', clerkId)
            .single();

        if (existingUser && !fetchError) {
            console.log('Existing user found:', existingUser);
            return existingUser;
        }

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new users
            console.error('Error checking for existing user:', fetchError);
        }
    } catch (err) {
        console.log('No existing user found, will create new one');
    }

    console.log('No existing user found, creating new user...');

    // Create new user if doesn't exist
    // IMPORTANT: Use the default supabase client (not the authenticated one) to bypass RLS
    // This allows us to create the initial user record
    const { data, error } = await supabase
        .from('users')
        .insert({
            clerk_id: clerkId,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            image_url: userData.imageUrl,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return null;
    }

    console.log('User created successfully:', data);
    return data;
}

export async function createSchool(schoolData: CreateSchoolData, adminUserId: string) {
    console.log('Creating school with data:', schoolData);
    console.log('Admin user ID:', adminUserId);
    console.log('School data type:', typeof schoolData);
    console.log('Admin user ID type:', typeof adminUserId);

    const insertData = {
        name: schoolData.name.trim(),
        subdomain: schoolData.subdomain.trim().toLowerCase(),
        description: schoolData.description.trim(),
        plan_type: schoolData.planType,
        max_users: schoolData.maxUsers,
        admin_user_id: adminUserId,
    };

    console.log('Insert data being sent:', insertData);

    const { data, error } = await supabase
        .from('schools')
        .insert(insertData)
        .select()
        .single();

    console.log('Supabase response - data:', data, 'error:', error);

    if (error) {
        console.error('Error creating school:', error);
        console.error('Raw error object:', JSON.stringify(error, null, 2));
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error.constructor.name);

        if (error && typeof error === 'object') {
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
        }

        throw error;
    }

    console.log('School created successfully:', data);
    return data;
}

export async function addUserToSchool(userId: string, schoolId: string, role: 'admin' | 'teacher' | 'student') {
    const { error } = await supabase
        .from('user_schools')
        .insert({
            user_id: userId,
            school_id: schoolId,
            role: role,
        });

    if (error) {
        throw error;
    }
}

export async function getUserSchools(clerkId: string) {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

    if (!user) return [];

    const { data, error } = await supabase
        .from('user_schools')
        .select(`
      role,
      schools (
        id,
        name,
        subdomain,
        description,
        plan_type,
        max_users,
        status,
        created_at
      )
    `)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching user schools:', error);
        return [];
    }

    return data;
}

export async function getSchoolStats(schoolId: string) {
    // Get user count
    const { count: userCount } = await supabase
        .from('user_schools')
        .select('*', { count: 'exact' })
        .eq('school_id', schoolId);

    // Get class count
    const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact' })
        .eq('school_id', schoolId);

    return {
        user_count: userCount || 0,
        class_count: classCount || 0
    };
}