"use client";

import {useState} from "react";
import Image from "next/image";
import {Document} from "@/lib/data";
import {File, ExternalLink, Download} from "lucide-react";
import {Button} from "@/components/ui/button";

interface DocumentViewerProps {
  document: Document;
  className?: string;
  showDownloadButton?: boolean;
}

export default function DocumentViewer({
  document,
  className = "",
  showDownloadButton = true,
}: DocumentViewerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const isImage = (extension: string): boolean => {
    return ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(
      extension
    );
  };

  const isPDF = (extension: string): boolean => {
    return extension === "pdf";
  };

  const isVideo = (extension: string): boolean => {
    return ["mp4", "webm", "avi", "mov", "wmv", "flv", "mkv"].includes(
      extension
    );
  };

  const isAudio = (extension: string): boolean => {
    return ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension);
  };

  const isText = (extension: string): boolean => {
    return ["txt", "md", "csv", "json", "xml", "log"].includes(extension);
  };

  const isOfficeDoc = (extension: string): boolean => {
    return ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(extension);
  };

  const fileExtension = getFileExtension(document.fileName);

  const handleDownload = () => {
    window.open(document.fileUrl, "_blank");
  };

  const renderViewer = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
          <File className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Preview not available
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            This document type cannot be previewed in the browser.
          </p>
          {showDownloadButton && (
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download to view
            </Button>
          )}
        </div>
      );
    }

    // Image files
    if (isImage(fileExtension)) {
      return (
        <div className="relative bg-muted rounded-lg overflow-hidden">
          <Image
            src={document.fileUrl}
            alt={document.title}
            width={800}
            height={600}
            className="w-full h-auto max-h-[600px] object-contain"
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="animate-pulse text-muted-foreground">
                Loading image...
              </div>
            </div>
          )}
        </div>
      );
    }

    // PDF files
    if (isPDF(fileExtension)) {
      return (
        <div className="bg-muted rounded-lg overflow-hidden">
          <iframe
            src={`${document.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-[600px] border-0"
            title={document.title}
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="flex items-center justify-center h-[600px] bg-background">
              <div className="animate-pulse text-muted-foreground">Loading PDF...</div>
            </div>
          )}
        </div>
      );
    }

    // Video files
    if (isVideo(fileExtension)) {
      return (
        <div className="bg-muted rounded-lg overflow-hidden">
          <video
            src={document.fileUrl}
            controls
            className="w-full max-h-[600px]"
            onError={() => setError(true)}
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support the video tag.
          </video>
          {loading && (
            <div className="flex items-center justify-center h-64 bg-background">
              <div className="animate-pulse text-muted-foreground">
                Loading video...
              </div>
            </div>
          )}
        </div>
      );
    }

    // Audio files
    if (isAudio(fileExtension)) {
      return (
        <div className="bg-muted rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 11-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-4">Audio File</h3>
          <audio
            src={document.fileUrl}
            controls
            className="w-full max-w-md mx-auto"
            onError={() => setError(true)}
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Text files
    if (isText(fileExtension)) {
      return (
        <div className="bg-muted rounded-lg overflow-hidden">
          <iframe
            src={document.fileUrl}
            className="w-full h-[600px] border-0"
            title={document.title}
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="flex items-center justify-center h-[600px] bg-background">
              <div className="animate-pulse text-muted-foreground">
                Loading document...
              </div>
            </div>
          )}
        </div>
      );
    }

    // Office documents (Word, PowerPoint, Excel)
    if (isOfficeDoc(fileExtension)) {
      return (
        <div className="bg-muted rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Office Document
          </h3>
          <p className="text-muted-foreground mb-6">
            {fileExtension.toUpperCase()} files cannot be previewed directly in
            the browser.
          </p>
          <div className="space-y-3">
            {showDownloadButton && (
              <Button onClick={handleDownload} className="mr-3">
                <Download className="w-4 h-4 mr-2" />
                Download to view
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    document.fileUrl
                  )}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Office Online
            </Button>
          </div>
        </div>
      );
    }

    // Fallback for unknown file types
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <File className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-card-foreground mb-2">
          Unknown file type
        </h3>
        <p className="text-muted-foreground text-center mb-4">
          This file type (.{fileExtension}) is not supported for preview.
        </p>
        {showDownloadButton && (
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download file
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <File className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium text-card-foreground">{document.fileName}</h3>
            <p className="text-sm text-muted-foreground">
              {document.formattedSize} • {fileExtension.toUpperCase()}
            </p>
          </div>
        </div>
        {showDownloadButton && (
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
      <div className="p-4">{renderViewer()}</div>
    </div>
  );
}
