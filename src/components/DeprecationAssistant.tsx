import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, RefreshCw, MousePointer, FileText, FolderOpen, HelpCircle } from 'lucide-react';

interface DeprecationAssistantProps {
  onBack: () => void;
  onSearchSelection: () => void;
  onSearchPage: () => void;
  onSearchFile: () => void;
}

export const DeprecationAssistant: React.FC<DeprecationAssistantProps> = ({
  onBack,
  onSearchSelection,
  onSearchPage,
  onSearchFile
}) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header with Back Button */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 px-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 -mt-4">
        {/* Title Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Deprecation Assistant</h1>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our Deprecation Assistant automatically updates deprecated design system 
            components across your Figma files, saving hours of manual work while 
            ensuring your designs stay consistent with the latest standards.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-primary cursor-pointer hover:underline">
            <HelpCircle className="w-3 h-3" />
            <span>How does this work?</span>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">
          How would you like to find the components?
        </p>
        
        <div className="flex flex-col gap-2">
          {/* Current Selection */}
          <Card 
            className="cursor-pointer border hover:bg-accent transition-colors"
            onClick={onSearchSelection}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center w-6 h-6 text-muted-foreground">
                <MousePointer className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Current selection</span>
            </CardContent>
          </Card>
          
          {/* Current Page */}
          <Card 
            className="cursor-pointer border hover:bg-accent transition-colors"
            onClick={onSearchPage}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center w-6 h-6 text-muted-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Current page</span>
            </CardContent>
          </Card>
          
          {/* Entire File */}
          <Card 
            className="cursor-pointer border hover:bg-accent transition-colors"
            onClick={onSearchFile}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center w-6 h-6 text-muted-foreground">
                <FolderOpen className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Entire file</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};