"use client";

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {useAuth} from "@clerk/nextjs";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  File,
  Calendar,
  Edit,
  Trash,
  X,
  Lock,
  Globe,
  Check,
  Box,
  User,
} from "lucide-react";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  getAuthorById,
} from "@/lib/api";
import {Document, Author} from "@/lib/data";
import DocumentViewer from "@/components/document-viewer";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const {getToken, userId} = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [author, setAuthor] = useState<Author | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isPublic: true,
  });

  const documentId = params.id as string;
  const isOwner = document && userId === document.authorId;

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  useEffect(() => {
    if (document?.authorId) {
      const fetchAuthor = async () => {
        try {
          const token = await getToken();
          const response = await getAuthorById(document.authorId, token || undefined);
          if (response.success && response.data) {
            setAuthor(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch author:", error);
        }
      };
      fetchAuthor();
    }
  }, [document?.authorId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await getDocumentById(documentId, token || undefined);

      if (response.success && response.data) {
        setDocument(response.data);
        setEditForm({
          title: response.data.title,
          description: response.data.description || "",
          isPublic: response.data.isPublic,
        });
      } else {
        toast.error(response.error || "Document not found");
        router.push("/documents");
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to load document");
      router.push("/documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !isOwner) return;

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const response = await updateDocument(document._id, editForm, token);
      if (response.success && response.data) {
        setDocument(response.data);
        setEditing(false);
        toast.success("Document updated successfully");
      } else {
        toast.error(response.error || "Failed to update document");
      }
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!document || !isOwner) return;

    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      await deleteDocument(document._id, token);
      toast.success("Document deleted successfully");
      router.push(`/authors/${document.authorId}`);
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  };

  const getFileExtension = (filename: string): string | null => {
    return filename.split(".").pop() || null;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-300 rounded-lg"></div>
              <div className="h-32 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <File className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Document not found</h1>
          <p className="text-muted-foreground mb-6">
            The document you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link href="/documents">
            <Button>Browse Documents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({...editForm, title: e.target.value})
                    }
                    className="text-2xl font-bold"
                    placeholder="Document title"
                  />
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({...editForm, description: e.target.value})
                    }
                    placeholder="Document description (optional)"
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={editForm.isPublic}
                      onCheckedChange={(checked) =>
                        setEditForm({...editForm, isPublic: checked})
                      }
                    />
                    <Label htmlFor="isPublic">Make this document public</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} variant="default">
                      <Check className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">
                        {document.title}
                      </h1>
                      {document.description && (
                        <p className="text-lg text-muted-foreground">
                          {document.description}
                        </p>
                      )}
                    </div>
                    {isOwner && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDelete}
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:text-red-400"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {document.isPublic ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Uploaded {formatDate(document.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Box className="w-4 h-4" />
                      <span>{document.formattedSize}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Document Viewer */}
            {!editing && (
              <div className="bg-card rounded-lg border border-border">
                <DocumentViewer
                  document={document}
                  showDownloadButton={true}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author info */}
            <div className="bg-card border border-border rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 text-card-foreground">Author</h3>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  {author?.imageUrl ? (
                    <AvatarImage src={author.imageUrl} />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </span>
                  )}
                </Avatar>
                <div>
                  <Link
                    href={`/authors/${document.authorId}`}
                    className="font-medium hover:underline text-card-foreground"
                  >
                    {document.authorName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Document author
                  </p>
                </div>
              </div>
            </div>

            {/* Document details */}
            <div className="bg-card border border-border rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 text-card-foreground">Document Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File name:</span>
                  <span className="font-medium text-card-foreground">{document.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File size:</span>
                  <span className="font-medium text-card-foreground">{document.formattedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File type:</span>
                  <span className="font-medium text-card-foreground">
                    {getFileExtension(document.fileName)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium text-card-foreground">
                    {formatDate(document.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibility:</span>
                  <Badge variant={document.isPublic ? "default" : "secondary"}>
                    {document.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
