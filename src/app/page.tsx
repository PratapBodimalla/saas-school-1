"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Calendar, CreditCard, Shield, Zap, Star, ArrowRight } from "lucide-react";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import UserButton from "@/components/auth/UserButton";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edu Platform
          </span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
        </div>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="outline">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
          🚀 Trusted by 500+ Schools Worldwide
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Transform Your School with
          <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smart Management
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Streamline administration, empower teachers, and enhance student experience with our comprehensive
          multi-tenant school management platform. Get your own secure subdomain and start managing your school like never before.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Setup in minutes</span>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-gray-600 mb-4">Trusted by leading educational institutions</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">School District A</div>
            <div className="text-2xl font-bold text-gray-400">Academy B</div>
            <div className="text-2xl font-bold text-gray-400">College C</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your School
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From student management to fee collection, we've got every aspect of school administration covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Multi-Tenant Architecture</CardTitle>
              <CardDescription>
                Each school gets its own secure subdomain with complete data isolation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Smart Timetable Management</CardTitle>
              <CardDescription>
                Create and manage class schedules, teacher assignments, and attendance tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Fee Management</CardTitle>
              <CardDescription>
                Track payments, generate receipts, and manage fee collection seamlessly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure access control for admins, teachers, and students with appropriate permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Quick Setup</CardTitle>
              <CardDescription>
                Get your school up and running in minutes with automated onboarding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle>Customizable Dashboard</CardTitle>
              <CardDescription>
                Personalized views for each user role with intuitive navigation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Your journey to better school management starts here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up Your School</h3>
              <p className="text-gray-600">
                Register your school and get a unique subdomain instantly. No technical setup required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Invite Your Team</h3>
              <p className="text-gray-600">
                Upload teacher and student lists. We'll send personalized invitations automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Managing</h3>
              <p className="text-gray-600">
                Configure classes, timetables, and start managing your school operations efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools already using Edu Platform to streamline their operations and enhance student experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                    Start Free Trial Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                  Schedule Demo
                </Button>
              </>
            )}
          </div>
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">Edu Platform</span>
              </div>
              <p className="text-gray-400">
                Empowering schools with smart management solutions for the digital age.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Edu Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
