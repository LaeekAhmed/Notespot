"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserX, Calendar } from "lucide-react";
import { getAllAuthors } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  imageUrl: string;
  email: string;
  createdAt: number;
  lastActiveAt: number;
}

export default function AuthorsPage() {
  const { userId } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      const filtered = authors.filter(author => {
        const fullName = `${author.firstName} ${author.lastName}`.toLowerCase();
        const username = author.username?.toLowerCase() || "";
        const email = author.email || "";
        const searchTerm = debouncedSearch.toLowerCase();
        
        return fullName.includes(searchTerm) || 
               username.includes(searchTerm) || 
               email.includes(searchTerm);
      });
      setFilteredAuthors(filtered);
    } else {
      setFilteredAuthors(authors);
    }
  }, [debouncedSearch, authors]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAuthors();
      
      if (response.success && response.data) {
        setAuthors(response.data);
        setFilteredAuthors(response.data);
      } else {
        setError("Failed to fetch authors");
      }
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      setError("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isCurrentUser = (authorId: string) => {
    return authorId === userId;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-muted-foreground">
            Discover and explore documents from our community of authors
          </p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search authors by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading indicator for search */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Loading authors...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <UserX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{error}</h3>
            <button
              onClick={fetchAuthors}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Authors Grid */}
        {!loading && !error && (
          <>
            {debouncedSearch && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredAuthors.length} of {authors.length} authors
                  {debouncedSearch && ` for "${debouncedSearch}"`}
                </p>
              </div>
            )}

            {filteredAuthors.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredAuthors.map((author) => (
                  <Link key={author.id} href={`/authors/${author.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="flex flex-col gap-4 p-4">
                        {/* Author Avatar and Info */}
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={author.imageUrl} />
                            <AvatarFallback>
                              {getInitials(author.firstName, author.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate hover:underline">
                                {author.firstName} {author.lastName}
                              </h3>
                              {isCurrentUser(author.id) && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            {author.username && (
                              <p className="text-sm text-muted-foreground truncate">
                                @{author.username}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Author Details */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p className="truncate">
                            {author.email}
                          </p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Member since {formatDate(author.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No authors found</h3>
                <p className="text-muted-foreground">
                  {debouncedSearch 
                    ? `No authors match "${debouncedSearch}". Try adjusting your search terms.`
                    : "No authors available at the moment"
                  }
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
