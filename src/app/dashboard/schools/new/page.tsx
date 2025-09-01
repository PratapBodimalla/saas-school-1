"use client";

import { useState } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Building2 } from "lucide-react";
import Link from "next/link";
import { createSchool, addUserToSchool, getCurrentUser, createUserIfNotExists } from "@/lib/school-management";

export default function NewSchoolPage() {
    const { user } = useUser();
    const { session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        description: '',
        planType: 'BASIC' as 'BASIC' | 'PRO' | 'ENTERPRISE',
        maxUsers: 100
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!formData.name.trim()) {
            setErrors({ name: 'School name is required' });
            return;
        }
        if (!formData.subdomain.trim()) {
            setErrors({ subdomain: 'Subdomain is required' });
            return;
        }
        if (formData.subdomain.length < 3) {
            setErrors({ subdomain: 'Subdomain must be at least 3 characters' });
            return;
        }
        if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
            setErrors({ subdomain: 'Subdomain can only contain lowercase letters, numbers, and hyphens' });
            return;
        }

        setLoading(true);

        try {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            console.log('User authenticated:', user.id);
            console.log('Session:', session);

            const supabase = createClerkSupabaseClient(session);
            console.log('Supabase client created:', !!supabase);

            // Get or create current user
            const currentUser = await createUserIfNotExists(user.id, {
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            }, supabase);

            if (!currentUser) throw new Error('Failed to get or create user in database');

            // Create school
            const school = await createSchool(formData, currentUser.id);

            // Add user as admin to the school
            await addUserToSchool(currentUser.id, school.id, 'admin');

            // Redirect to school dashboard
            console.log('Redirecting to schools list');
            router.push('/dashboard/schools');
        } catch (error: any) {
            console.error('Error creating school:', error);

            if (error.code === '23505' && error.message.includes('subdomain')) {
                setErrors({ subdomain: 'This subdomain is already taken' });
            } else {
                setErrors({ general: 'Failed to create school. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubdomainChange = (value: string) => {
        const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: cleanValue });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Edu Platform</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </span>
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                Sign Out
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button */}
                    <Link href="/dashboard/schools" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Schools
                    </Link>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Plus className="h-5 w-5 text-green-600" />
                                <span>Create New School</span>
                            </CardTitle>
                            <CardDescription>
                                Set up a new school with its own subdomain and configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* School Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        School Name *
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter school name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Subdomain */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subdomain *
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            value={formData.subdomain}
                                            onChange={(e) => handleSubdomainChange(e.target.value)}
                                            placeholder="school-name"
                                            className={errors.subdomain ? 'border-red-500' : ''}
                                        />
                                        <span className="text-gray-500">.eduplatform.com</span>
                                    </div>
                                    {errors.subdomain && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                                    )}
                                    <p className="text-gray-500 text-sm mt-1">
                                        This will be your school's unique URL. Only lowercase letters, numbers, and hyphens allowed.
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of your school"
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Plan Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plan Type
                                    </label>
                                    <select
                                        value={formData.planType}
                                        onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="BASIC">BASIC - Up to 100 users</option>
                                        <option value="PRO">PRO - Up to 500 users</option>
                                        <option value="ENTERPRISE">ENTERPRISE - Unlimited users</option>
                                    </select>
                                </div>

                                {/* Max Users */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Users
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 100 })}
                                        min="1"
                                        max="10000"
                                    />
                                    <p className="text-gray-500 text-sm mt-1">
                                        Maximum number of users (teachers and students) for this school
                                    </p>
                                </div>

                                {/* General Error */}
                                {errors.general && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <p className="text-red-800 text-sm">{errors.general}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {loading ? 'Creating School...' : 'Create School'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}