"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CreditCard, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Edu Platform</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </span>
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">School Dashboard</h1>
                    <p className="text-gray-600">Manage your school operations and monitor key metrics</p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,247</div>
                            <p className="text-xs text-muted-foreground">+12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">89</div>
                            <p className="text-xs text-muted-foreground">+3% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Classes</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42</div>
                            <p className="text-xs text-muted-foreground">Active classes today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$89,420</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span>Manage Students</span>
                            </CardTitle>
                            <CardDescription>
                                Add, edit, and manage student records
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <span>Class Schedule</span>
                            </CardTitle>
                            <CardDescription>
                                Create and manage class timetables
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <span>Fee Management</span>
                            </CardTitle>
                            <CardDescription>
                                Track payments and generate receipts
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5 text-orange-600" />
                                <span>School Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure school preferences and settings
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-indigo-600" />
                                <span>Teacher Management</span>
                            </CardTitle>
                            <CardDescription>
                                Manage teacher accounts and assignments
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-red-600" />
                                <span>Attendance</span>
                            </CardTitle>
                            <CardDescription>
                                Track student and teacher attendance
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </main>
        </div>
    );
}
