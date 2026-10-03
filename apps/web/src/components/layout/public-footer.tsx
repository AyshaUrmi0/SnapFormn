import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 text-muted-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-foreground">Snapform</span>
            </Link>
            <p className="text-sm max-w-sm mb-4 leading-relaxed">
              The Notion-style form builder. Create beautiful, conversational, and highly engaging forms without leaving your keyboard.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/AyshaUrmi0/SnapFormn"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>

          {/* Product col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.TEMPLATES} className="hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ROADMAP} className="hover:text-foreground transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href={ROUTES.WHATS_NEW} className="hover:text-foreground transition-colors">
                  What&apos;s New
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources col */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.GUIDES} className="hover:text-foreground transition-colors">
                  How-to Guides
                </Link>
              </li>
              <li>
                <Link href={ROUTES.HELP_CENTER} className="hover:text-foreground transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LOGIN} className="hover:text-foreground transition-colors">
                  Creator Login
                </Link>
              </li>
              <li>
                <Link href={ROUTES.REGISTER} className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>36 Form Field Types</li>
              <li>Slash Command Editor</li>
              <li>Signed Media Uploads</li>
              <li>Conditional Logic Engine</li>
              <li>Instant Realtime Preview</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} Snapform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, React 19, TipTap & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
