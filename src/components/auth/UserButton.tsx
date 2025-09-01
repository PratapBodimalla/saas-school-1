"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export default function UserButton() {
    return (
        <ClerkUserButton
            appearance={{
                elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonPopoverCard: "shadow-lg border border-gray-200",
                    userButtonPopoverActionButton: "hover:bg-gray-50 transition-colors duration-200",
                    userButtonPopoverActionButtonText: "text-gray-700",
                }
            }}
        />
    );
}
