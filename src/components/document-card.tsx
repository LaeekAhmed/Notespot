"use client";

import Link from "next/link";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {
  File,
  Calendar,
  Download,
  Lock,
  Globe,
  FileText,
  ImageIcon,
  Video,
  Volume,
  Table,
  Presentation,
} from "lucide-react";
import {Document} from "@/lib/data";

interface DocumentCardProps {
  document: Document;
  showAuthor?: boolean;
  showPrivacyIndicator?: boolean;
  className?: string;
}

export default function DocumentCard({
  document,
  showAuthor = true,
  showPrivacyIndicator = false,
  className = "",
}: DocumentCardProps) {
  const getFileExtension = (filename: string): string | null => {
    return filename.split(".").pop()?.toLowerCase() || null;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If the date is invalid, try to parse it differently
        return new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getFileType = (extension: string | null) => {
    if (!extension) return File;

    const imageTypes = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
    const videoTypes = ["mp4", "webm", "avi", "mov", "wmv", "flv", "mkv"];
    const audioTypes = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];
    const textTypes = ["txt", "md", "csv", "json", "xml", "log"];
    const spreadsheetTypes = ["xls", "xlsx", "csv"];
    const presentationTypes = ["ppt", "pptx"];

    if (imageTypes.includes(extension)) return ImageIcon;
    if (videoTypes.includes(extension)) return Video;
    if (audioTypes.includes(extension)) return Volume;
    if (extension === "pdf") return FileText;
    if (spreadsheetTypes.includes(extension)) return Table;
    if (presentationTypes.includes(extension)) return Presentation;
    if (textTypes.includes(extension)) return FileText;

    return File;
  };

  const getFileTypeColor = (extension: string | null) => {
    if (!extension) return "text-gray-500";

    const imageTypes = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
    const videoTypes = ["mp4", "webm", "avi", "mov", "wmv", "flv", "mkv"];
    const audioTypes = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];

    if (imageTypes.includes(extension)) return "text-green-500";
    if (videoTypes.includes(extension)) return "text-purple-500";
    if (audioTypes.includes(extension)) return "text-blue-500";
    if (extension === "pdf") return "text-red-500";
    if (["xls", "xlsx"].includes(extension)) return "text-green-600";
    if (["ppt", "pptx"].includes(extension)) return "text-orange-500";
    if (["doc", "docx"].includes(extension)) return "text-blue-600";

    return "text-gray-500";
  };

  const canShowPreview = (extension: string | null): boolean => {
    if (!extension) return false;
    const previewableTypes = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg",
    ];
    return previewableTypes.includes(extension);
  };

  const extension = getFileExtension(document.fileName);
  const FileType = getFileType(extension);
  const fileTypeColor = getFileTypeColor(extension);

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="relative aspect-video rounded-md bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          {document.coverImage || canShowPreview(extension) ? (
            <div className="relative w-full h-full">
              <Image
                src={document.coverImage || document.fileUrl}
                width={400}
                height={225}
                alt="Document Preview"
                className="aspect-video rounded-md object-cover transition-transform hover:scale-105"
                style={{width: "100%", height: "100%"}}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div
              className={`flex flex-col items-center gap-2 ${fileTypeColor}`}
            >
              <FileType className="w-12 h-12" />
              <span className="text-xs font-medium">
                {extension?.toUpperCase() || "FILE"}
              </span>
            </div>
          )}

          {/* Privacy indicator */}
          {showPrivacyIndicator && (
            <div className="absolute top-2 right-2">
              {document.isPublic ? (
                <Badge variant="default" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          )}

          {/* File type badge */}
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className="text-xs bg-white/90 backdrop-blur-sm"
            >
              {extension?.toUpperCase() || "FILE"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            href={`/documents/${document._id}`}
            className="text-lg font-medium hover:underline line-clamp-2 leading-tight"
            prefetch={false}
          >
            {document.title}
          </Link>

          {document.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {document.description}
            </p>
          )}

          {showAuthor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/placeholder-user.jpg" />
              </Avatar>
              <Link
                href={`/authors/${document.authorId}`}
                className="hover:underline truncate"
                prefetch={false}
              >
                {document.authorName}
              </Link>
            </div>
          )}

          {/* File info footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(document.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{document.formattedSize}</span>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{document.downloadCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
