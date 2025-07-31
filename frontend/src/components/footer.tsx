import Link from "next/link";
import {Github, Linkedin, Mail} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          {/* Brand - Left side */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Notespot</span>
              <span className="text-sm text-muted-foreground">
                Document sharing platform
              </span>
            </div>
          </div>

          {/* Social Links - Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/LaeekAhmed/Notespot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </Link>
            <Link
              href="https://linkedin.com/in/laeek-ahmed"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
            <Link
              href="mailto:laeek385@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
