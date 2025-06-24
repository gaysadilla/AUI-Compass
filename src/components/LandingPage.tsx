import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { HeartPulse, RefreshCw, Grid3X3, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onDeprecationAssistantClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDeprecationAssistantClick }) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4 pb-2">
        <div className="flex-shrink-0">
          <img 
            src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/logo.png" 
            alt="AUI Compass Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-foreground">AUI Compass</h1>
          <p className="text-sm text-muted-foreground">
            AUI's Plugin Suite to take your designs to the next level
          </p>
        </div>
      </div>

      {/* Prompt */}
      <div className="-mt-2">
        <p className="text-sm font-semibold text-foreground">How can we help you today?</p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* AUI Health Check */}
        <Card className="relative cursor-not-allowed opacity-60 border-dashed">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-secondary">
                <HeartPulse className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2 py-0.5">
                Coming soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-sm font-semibold mb-2">AUI Health Check</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Get a quick status check of your AUI usage across your file
            </CardDescription>
          </CardContent>
        </Card>

        {/* Deprecation Assistant */}
        <Card 
          className="relative cursor-pointer border-primary hover:bg-accent transition-colors"
          onClick={onDeprecationAssistantClick}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground">
                <RefreshCw className="w-6 h-6" />
              </div>
              <Badge variant="beta" className="text-[10px] px-2 py-0.5">
                In Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-sm font-semibold mb-2">Deprecation Assistant</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Swap to the newest version of component with no data loss
            </CardDescription>
          </CardContent>
        </Card>

        {/* Component Modules */}
        <Card className="relative cursor-not-allowed opacity-60 border-dashed">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-secondary">
                <Grid3X3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2 py-0.5">
                Coming soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-sm font-semibold mb-2">Component Modules</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Discover related component and modules for all of AUI's offerings
            </CardDescription>
          </CardContent>
        </Card>

        {/* Icon Gallery */}
        <Card className="relative cursor-not-allowed opacity-60 border-dashed">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-secondary">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2 py-0.5">
                Coming soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-sm font-semibold mb-2">Icon Gallery</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              View all available icons from AUI in one easy to view place
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};