import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { HeartPulse, RefreshCw, Grid3X3, BookOpen, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onDeprecationAssistantClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDeprecationAssistantClick }) => {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-6 mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-background/80 backdrop-blur-sm rounded-xl border shadow-sm">
            <img 
              src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/logo.png" 
              alt="AUI Compass Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AUI Compass
              </h1>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              AUI's comprehensive plugin suite designed to elevate your design workflow and accelerate development
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">How can we help you today?</h2>
        <p className="text-sm text-muted-foreground">Choose a tool to get started with your design optimization</p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Deprecation Assistant - Featured */}
        <Card 
          className="relative cursor-pointer group border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
          onClick={onDeprecationAssistantClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <Badge variant="beta" className="text-[10px] px-2.5 py-1 font-medium">
                In Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
              Deprecation Assistant
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground">
              Seamlessly migrate to the latest component versions with intelligent data preservation
            </CardDescription>
          </CardContent>
        </Card>

        {/* AUI Health Check */}
        <Card className="relative cursor-not-allowed group border-dashed border-border/60 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted border shadow-sm">
                <HeartPulse className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2.5 py-1 font-medium">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-muted-foreground">
              AUI Health Check
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">
              Comprehensive analysis of your AUI component usage and optimization recommendations
            </CardDescription>
          </CardContent>
        </Card>

        {/* Component Modules */}
        <Card className="relative cursor-not-allowed group border-dashed border-border/60 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted border shadow-sm">
                <Grid3X3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2.5 py-1 font-medium">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-muted-foreground">
              Component Modules
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">
              Explore and discover related components across the entire AUI ecosystem
            </CardDescription>
          </CardContent>
        </Card>

        {/* Icon Gallery */}
        <Card className="relative cursor-not-allowed group border-dashed border-border/60 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted border shadow-sm">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <Badge variant="coming-soon" className="text-[10px] px-2.5 py-1 font-medium">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-muted-foreground">
              Icon Gallery
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">
              Browse and integrate AUI icons with advanced search and preview capabilities
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Built with ❤️ by the AUI team • Version 1.0.0
        </p>
      </div>
    </div>
  );
};