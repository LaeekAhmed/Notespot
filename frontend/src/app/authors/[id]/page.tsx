"use client";

import {useState, useEffect} from "react";
import {useParams, useSearchParams} from "next/navigation";
import Link from "next/link";
import {useAuth} from "@clerk/nextjs";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Search, File, Upload} from "lucide-react";
import {getDocumentsByAuthor} from "@/lib/api";
import {Document, Author, AuthorDocumentsResponse} from "@/lib/data";
import DocumentCard from "@/components/document-card";
import {useDebounce} from "@/hooks/useDebounce";

export default function AuthorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const {getToken, userId} = useAuth();

  const [author, setAuthor] = useState<Author | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const authorId = params.id as string;
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchAuthorDocuments();
  }, [authorId, currentPage, debouncedSearch]);

  const fetchAuthorDocuments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response: AuthorDocumentsResponse = await getDocumentsByAuthor(
        authorId,
        {
          page: currentPage,
          limit: 12,
          search: debouncedSearch || undefined,
        },
        token || undefined
      );

      if (!author) {
        setAuthor(response.author);
      }
      if (!isOwnProfile) {
        setIsOwnProfile(response.isOwnProfile);
      }
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch author documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    author && (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Author Header */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="w-20 h-20">
              <AvatarImage src={author.imageUrl || "/placeholder-user.jpg"} />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {author.name}
              </h1>
              <p className="text-muted-foreground mb-2">{author.email}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {pagination.totalItems} document
                  {pagination.totalItems !== 1 ? "s" : ""}
                </span>
                {isOwnProfile && (
                  <Badge variant="secondary">Your Profile</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${
                  isOwnProfile ? "your" : author.name + "'s"
                } documents`}
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
                <span>Searching documents...</span>
              </div>
            </div>
          )}

          {/* Documents Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg border p-4">
                    <div className="aspect-video bg-gray-300 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <>
              {debouncedSearch && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {documents.length} of {pagination.totalItems}{" "}
                    documents for "{debouncedSearch}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {documents.map((document) => (
                  <DocumentCard
                    key={document._id}
                    document={document}
                    showAuthor={false}
                    showPrivacyIndicator={isOwnProfile}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Link
                    href={`/authors/${authorId}?page=${currentPage - 1}`}
                    className={currentPage <= 1 ? "pointer-events-none" : ""}
                  >
                    <Button variant="outline" disabled={!pagination.hasPrev}>
                      Previous
                    </Button>
                  </Link>

                  <span className="text-sm text-muted-foreground px-4">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <Link
                    href={`/authors/${authorId}?page=${currentPage + 1}`}
                    className={
                      currentPage >= pagination.totalPages
                        ? "pointer-events-none"
                        : ""
                    }
                  >
                    <Button variant="outline" disabled={!pagination.hasNext}>
                      Next
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <File className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {debouncedSearch
                  ? "No documents found"
                  : `${author.name} hasn't uploaded any documents yet`}
              </h3>
              <p className="text-muted-foreground">
                {debouncedSearch
                  ? `No documents match "${debouncedSearch}". Try adjusting your search terms.`
                  : isOwnProfile
                  ? "Upload your first document to get started!"
                  : "Check back later for new uploads."}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
}
