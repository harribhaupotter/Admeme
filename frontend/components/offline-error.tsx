'use client';

import { Github, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineError() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-chart-4/15 to-chart-2/20 ring-2 ring-primary/15">
            <svg
              className="h-12 w-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 3h4.5M3 7.5h18M4.5 9v8.25a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V9M9 12h6M8.25 16.5h7.5"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            The Virality Critic is Asleep
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            This AI backend is hosted on a free cloud GPU that spins down when not in use.
            Wake it up or check out the demo to see what&apos;s possible!
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Button
            asChild
            className="inline-flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <a
              href="https://github.com/harribhaupotter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4" />
              Contact @harribhaupotter to wake it up
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="inline-flex items-center justify-center gap-2 border-primary/25 bg-card/80 hover:border-primary/40 hover:bg-primary/5"
          >
            <a href="#demo">
              <Play className="w-4 h-4" />
              Watch the Demo Video
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
