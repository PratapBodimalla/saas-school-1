"use client";

import { SignUp as ClerkSignUp } from "@clerk/nextjs";

export default function SignUp() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Join Edu Platform
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create your school management account
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
                    <ClerkSignUp
                        appearance={{
                            elements: {
                                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200",
                                card: "shadow-none",
                                headerTitle: "text-gray-900 text-xl font-semibold",
                                headerSubtitle: "text-gray-600",
                                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 transition-colors duration-200",
                                formFieldInput: "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                            }
                        }}
                    />
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-700">
                            Sign in here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
