"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Search, File} from "lucide-react";
import {getDocuments} from "@/lib/api";
import {Document, PaginationResponse} from "@/lib/data";
import DocumentCard from "@/components/document-card";
import {useDebounce} from "@/hooks/useDebounce";
import { useAuth } from "@clerk/nextjs";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<
    PaginationResponse<Document>["pagination"]
  >({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const {getToken} = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, debouncedSearch, sortBy, sortOrder, getToken]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await getDocuments({
        page: currentPage,
        limit: 12,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      }, token || undefined);
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">All Documents</h1>
          <p className="text-muted-foreground">
            Browse through our collection of publicly available documents
          </p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dropdown for sorting */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uploadDate">Upload Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="downloadCount">Downloads</SelectItem>
                <SelectItem value="fileSize">File Size</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {documents.length} of {pagination.totalItems} documents
                {debouncedSearch && ` for "${debouncedSearch}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  showAuthor={true}
                  showPrivacyIndicator={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={`/documents?page=${currentPage - 1}`}
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
                  href={`/documents?page=${currentPage + 1}`}
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
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {debouncedSearch
                ? `No documents match "${debouncedSearch}". Try adjusting your search terms.`
                : "Be the first to upload a document!"}
            </p>
            {debouncedSearch && (
              <Button
                variant="outline"
                onClick={() => setSearch("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
