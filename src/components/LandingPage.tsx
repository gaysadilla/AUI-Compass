import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { HeartPulse, RefreshCw, Grid3X3, BookOpen, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onDeprecationAssistantClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDeprecationAssistantClick }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
            <img 
              src="https://raw.githubusercontent.com/gaysadilla/AUI-Compass/main/assets/logo.png" 
              alt="AUI Compass Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                AUI Compass
              </h1>
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              AUI's comprehensive plugin suite designed to elevate your design workflow
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How can we help you today?</h2>
        <p className="text-sm text-gray-600">Choose a tool to get started with your design optimization</p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Deprecation Assistant - Active */}
        <Card 
          className="feature-card active border cursor-pointer"
          onClick={onDeprecationAssistantClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="relative">
                <div className="icon-container primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="status-indicator"></div>
              </div>
              <Badge variant="secondary" className="badge beta text-xs">
                In Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-gray-900">
              Deprecation Assistant
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 leading-relaxed">
              Seamlessly migrate to the latest component versions with intelligent data preservation
            </CardDescription>
          </CardContent>
        </Card>

        {/* AUI Health Check - Disabled */}
        <Card className="feature-card disabled border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="icon-container muted">
                <HeartPulse className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="badge coming-soon text-xs">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-gray-500">
              AUI Health Check
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 leading-relaxed">
              Comprehensive analysis of your AUI component usage and optimization recommendations
            </CardDescription>
          </CardContent>
        </Card>

        {/* Component Modules - Disabled */}
        <Card className="feature-card disabled border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="icon-container muted">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="badge coming-soon text-xs">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-gray-500">
              Component Modules
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 leading-relaxed">
              Explore and discover related components across the entire AUI ecosystem
            </CardDescription>
          </CardContent>
        </Card>

        {/* Icon Gallery - Disabled */}
        <Card className="feature-card disabled border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="icon-container muted">
                <BookOpen className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="badge coming-soon text-xs">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardTitle className="text-base font-semibold mb-2 text-gray-500">
              Icon Gallery
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 leading-relaxed">
              Browse and integrate AUI icons with advanced search and preview capabilities
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Built with ❤️ by the AUI team • Version 1.0.0
        </p>
      </div>
    </div>
  );
};