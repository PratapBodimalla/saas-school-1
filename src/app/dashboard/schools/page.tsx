"use client";

import { useState, useEffect } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Plus, ArrowRight, Users, Calendar, CreditCard, Building2 } from "lucide-react";
import Link from "next/link";
import { School, getUserSchools, getSchoolStats } from "@/lib/school-management";

export default function SchoolsPage() {
    const { user } = useUser();
    const { session } = useSession();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        async function fetchSchools() {
            if (user?.id && session) {
                try {
                    const userSchools = await getUserSchools(user.id);

                    // Get additional stats for each school
                    const schoolsWithStats = await Promise.all(
                        userSchools.map(async (userSchool: any) => {
                            const school = userSchool.schools;
                            const stats = await getSchoolStats(school.id);

                            return {
                                ...school,
                                user_count: stats.user_count,
                                class_count: stats.class_count
                            };
                        })
                    );

                    setSchools(schoolsWithStats);
                } catch (error) {
                    console.error('Error fetching schools:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchSchools();
    }, [user?.id, session]);

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'BASIC': return 'bg-blue-100 text-blue-800';
            case 'PRO': return 'bg-purple-100 text-purple-800';
            case 'ENTERPRISE': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
                    <Link href="/dashboard/schools/new">
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New School
                        </Button>
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search for a school"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Schools Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSchools.map((school) => (
                            <Card key={school.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{school.name}</CardTitle>
                                            <CardDescription className="text-sm text-gray-600">
                                                {school.subdomain}.eduplatform.com
                                            </CardDescription>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Plan</span>
                                            <Badge className={getPlanColor(school.plan_type)}>
                                                {school.plan_type}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <Badge className={getStatusColor(school.status)}>
                                                {school.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {school.user_count || 0} users
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {school.class_count || 0} classes
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-xs text-gray-500">
                                                Created {new Date(school.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSchools.map((school) => (
                            <Card key={school.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{school.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {school.subdomain}.eduplatform.com
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {school.user_count || 0} users
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {school.class_count || 0} classes
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={getPlanColor(school.plan_type)}>
                                                {school.plan_type}
                                            </Badge>
                                            <Badge className={getStatusColor(school.status)}>
                                                {school.status}
                                            </Badge>
                                            <ArrowRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredSchools.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Building2 className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first school'}
                        </p>
                        {!searchTerm && (
                            <Link href="/dashboard/schools/new">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First School
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}