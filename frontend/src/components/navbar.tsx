"use client";

import Link from "next/link";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {Home, Search, Upload, Menu, X, Users, FileText, Box} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const {user} = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Box className="w-6 h-6" />
            <span className="text-lg font-medium">Notespot</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
              prefetch={false}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/documents"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
              prefetch={false}
            >
              <Search className="w-4 h-4" />
              Browse
            </Link>
            <Link
              href="/authors"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
              prefetch={false}
            >
              <Users className="w-4 h-4" />
              Authors
            </Link>
            <SignedIn>
              <Link
                href={`/authors/${user?.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                prefetch={false}
              >
                <FileText className="w-4 h-4" />
                My Documents
              </Link>
              <Link
                href="/upload"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                prefetch={false}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Link>
            </SignedIn>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background shadow-lg">
          <nav className="container mx-auto py-4 px-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg"
                prefetch={false}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                href="/documents"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg"
                prefetch={false}
              >
                <Search className="w-5 h-5" />
                Browse
              </Link>
              <Link
                href="/authors"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg"
                prefetch={false}
              >
                <Users className="w-5 h-5" />
                Authors
              </Link>
              <SignedIn>
                <Link
                  href={`/authors/${user?.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg"
                  prefetch={false}
                >
                  <FileText className="w-5 h-5" />
                  My Documents
                </Link>
                <Link
                  href="/upload"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-lg"
                  prefetch={false}
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </Link>
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
