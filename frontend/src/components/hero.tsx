import Link from "next/link";
import {Button} from "@/components/ui/button";
import {getDocuments} from "@/lib/api";
import DocumentCard from "@/components/document-card";
import {Upload, FileText, Users, Globe, ArrowRight} from "lucide-react";

export default async function Hero() {
  const response = await getDocuments({
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        {/* Hero Section - no background, no blobs, no icon animation */}
        <section className="py-16 md:py-12">
          <div className="container mx-auto">
            <div className="grid items-center justify-center gap-8 px-4 text-center md:px-6">
              {/* Main heading with enhanced styling */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    Document Sharing Platform
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text bg-blue-600 text-transparent">
                  Share and Discover
                  <br />
                  <span className="text-blue-600">Documents</span>
                </h1>
                
                <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed">
                  Easily upload and share your documents with the world, or
                  browse through a vast collection of publicly available
                  documents.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link href="/upload">
                  <Button size="lg" className="px-8 py-3 text-lg font-semibold">
                    Upload Document
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/documents">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold">
                    Browse Documents
                  </Button>
                </Link>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="flex flex-col items-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Easy Upload</h3>
                  <p className="text-sm text-muted-foreground text-center">Simple drag & drop or click to upload your documents</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Global Access</h3>
                  <p className="text-sm text-muted-foreground text-center">Share with anyone, anywhere in the world</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Community</h3>
                  <p className="text-sm text-muted-foreground text-center">Join thousands of users sharing knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recently Uploaded Documents Section */}
        <section className="w-full py-16 md:py-24 bg-white/80">
          <div className="container mx-auto grid gap-8 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Recently Uploaded
              </h2>
              <p className="max-w-[900px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed">
                Browse through the latest documents shared by our community.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {response.data.map((document) => (
                <DocumentCard
                  key={document.shortId}
                  document={document}
                  showAuthor={true}
                  showPrivacyIndicator={false}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/documents">
                <Button variant="default" size="lg" className="px-8 py-3 text-lg font-semibold">
                  View All Documents
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
