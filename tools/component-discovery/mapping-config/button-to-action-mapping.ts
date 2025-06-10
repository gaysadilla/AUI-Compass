// Button to Action Complete Mapping Configuration

export interface ButtonProperties {
  Variant: 'Filled' | 'Outlined' | 'Flat' | '● Filled' | '○ Outlined';
  Size: 'Small' | 'Medium (Default)' | 'Large';
  State: 'Default' | 'Hover' | 'Pressed' | 'Disabled';
  Icon: 'None' | 'Left' | 'Right' | 'Icon only' | 'Left ❖' | 'Right ❖' | '❖ Left' | '❖ Right' | 'Icon ❖ only';
  Color: 'Asurion Purple' | 'Black' | 'White' | '🟣 Asurion Purple' | '⚫️ Black' | '⚪️ White';
  Label: string;
  'Icon Instance': any; // Component instance
}

export interface ActionMappingResult {
  actionProps: any;
  warnings: string[];
  iconMapping: {
    source: any;
    targetIconOnly?: string | null;
    targetLeft: string | null;
    targetRight: string | null;
  } | null;
  themeMode?: string; // Theme mode to apply based on Button color
}

export interface ActionProperties {
  _variant: 'Text' | 'Text and Icons' | 'Icon Only';
  Style: 'Filled' | 'Outlined' | 'Text';
  State: 'Enabled' | 'Disabled' | 'Hovered' | 'Pressed';
  Size: 'Small (S)' | 'Medium (Default)' | 'Large (L)';
  "Show 'Left icon'"?: boolean;
  Label?: string;
  "Show 'Right icon'"?: boolean;
  'Left icon instance'?: any;
  'Right icon instance'?: any;
  'Icon instance'?: any; // For Icon Only variant
}

export const determineActionVariant = (buttonProps: ButtonProperties): string => {
  if (buttonProps.Icon === 'Icon only') {
    return 'Icon Only';
  }
  if (buttonProps.Icon === 'None') {
    return 'Text';
  }
  if (buttonProps.Icon === 'Left' || buttonProps.Icon === 'Right') {
    return 'Text and Icons';
  }
  return 'Text';
};

export const buttonToActionMapping = {
  propertyMappings: {
    style: (buttonVariant: string): string => {
      switch (buttonVariant) {
        case 'Filled': return 'Filled';
        case 'Outlined': return 'Outlined';
        case 'Flat': return 'Text';
        default: return 'Filled';
      }
    },
    state: (buttonState: string): string => {
      switch (buttonState) {
        case 'Default': return 'Enabled';
        case 'Hover': return 'Hovered';
        case 'Pressed': return 'Pressed';
        case 'Disabled': return 'Disabled';
        default: return 'Enabled';
      }
    },
    size: (buttonSize: string): string => {
      switch (buttonSize) {
        case 'Small': return 'Small (S)';
        case 'Medium (Default)': return 'Medium (Default)';
        case 'Large': return 'Large (L)';
        default: return 'Medium (Default)';
      }
    },
    iconConfig: (buttonIcon: string): Partial<ActionProperties> => {
      switch (buttonIcon) {
        case 'None':
          return { "Show 'Left icon'": false, "Show 'Right icon'": false };
        case 'Left':
          return { "Show 'Left icon'": true, "Show 'Right icon'": false };
        case 'Right':
          return { "Show 'Left icon'": false, "Show 'Right icon'": true };
        case 'Icon only':
          return {}; // For Icon Only variant, no show icon properties needed
        default:
          return { "Show 'Left icon'": false, "Show 'Right icon'": false };
      }
    }
  },
  colorHandling: (buttonColor: string): { ignore: boolean; warning?: string } => {
    if (buttonColor !== 'Asurion Purple') {
      return {
        ignore: true,
        warning: `Color "${buttonColor}" is not mapped. Action component uses theme modes for color variations. Please set the appropriate theme/mode at the file level.`
      };
    }
    return { ignore: false };
  }
};

export function mapButtonToAction(buttonProps: ButtonProperties): ActionMappingResult {
  console.log('🗺️ Starting Button-to-Action mapping with precise property names...');
  
  const warnings: string[] = [];
  
  // Based on logs: Action uses "Outline" and "Filled" 
  const variantMapping: Record<string, string> = {
    '● Filled': 'Filled',
    '○ Outlined': 'Outline', // Correct value found in logs!
    'Filled': 'Filled',
    'Outlined': 'Outline'
  };

  // Based on analysis: Button uses "Default", Action uses "Enabled" 
  const stateMapping: Record<string, string> = {
    'Default': 'Enabled',
    'Hover': 'Hover',
    'Active': 'Active',
    'Disabled': 'Disabled'
  };

  // Determine Action variant based on Button icon configuration
  let actionVariant = 'Text'; // Default
  let showLeftIcon = false;
  let showRightIcon = false;

  if (buttonProps.Icon) {
    switch (buttonProps.Icon) {
      case '❖ Left': // Fix: Correct value from logs
      case 'Left ❖': // Alternative format
      case 'Left': // Simple format
        actionVariant = 'Text and Icons';
        showLeftIcon = true;
        break;
      case 'Right ❖':
      case '❖ Right': // Alternative format  
      case 'Right': // Simple format
        actionVariant = 'Text and Icons';
        showRightIcon = true;
        break;
      case 'Icon ❖ only': // Fix: Correct value from logs
      case 'Icon only': // Simple format
        actionVariant = 'Icon Only';
        showLeftIcon = true; // Icon only typically uses left icon
        break;
      case 'None':
        // FIXED: When Icon='None', always treat as Text variant regardless of icon instance
        actionVariant = 'Text';
        showLeftIcon = false;
        showRightIcon = false;
        break;
      default:
        // Only apply smart defaulting for truly unknown/undefined icon types, not 'None'
        if (buttonProps['Icon Instance'] && buttonProps['Icon Instance'] !== null) {
          actionVariant = 'Text and Icons';
          showLeftIcon = true; // Default to left icon when position is unclear
        } else {
          actionVariant = 'Text';
        }
        break;
    }
  }

  // Create the mapped Action properties using EXACT property names from analysis
  const actionProps = {
    // Main Action variant (what gets swapped to)
    _variant: actionVariant,
    
    // Nested component 1: Style=Filled, State=Enabled, Size=Medium (Default)
    'Style': variantMapping[buttonProps.Variant] || 'Filled',
    'State': stateMapping[buttonProps.State] || 'Enabled', 
    'Size': buttonProps.Size || 'Medium (Default)',
    
    // Nested component 2: .Action Content/Medium (default)
    'Action Text#12254:9': buttonProps.Label || '',
    "Show 'Left icon'#12254:10": showLeftIcon,
    "Show 'Right icon'#12254:11": showRightIcon,
    
    // Icon instance mapping (if provided)
    "Select 'Right' Icon#12538:5": showRightIcon ? buttonProps['Icon Instance'] : null,
    "Select 'Left' Icon#12538:1": showLeftIcon ? buttonProps['Icon Instance'] : null
  };

  console.log('🎯 Mapped Action properties:', actionProps);

  // Validate mappings
  if (!variantMapping[buttonProps.Variant]) {
    warnings.push(`Unknown Button variant: ${buttonProps.Variant}`);
  }
  
  if (!stateMapping[buttonProps.State]) {
    warnings.push(`Unknown Button state: ${buttonProps.State}`);
  }

  // Icon mapping for instance swapping
  let iconMapping = null;
  const hasIconInstance = buttonProps['Icon Instance'] && buttonProps['Icon Instance'] !== null && buttonProps['Icon Instance'] !== '';
  console.log('🔍 Icon mapping check:', { 
    hasIconInstance, 
    iconInstance: buttonProps['Icon Instance'], 
    showLeftIcon, 
    showRightIcon, 
    iconType: buttonProps.Icon,
    actionVariant
  });
  
  // FIXED: Always transfer icon instances if they exist, regardless of show state
  // This ensures icons are available in Action even if hidden by default
  // EXCEPTION: If Button explicitly has Icon='None', respect that choice
  if (hasIconInstance && buttonProps.Icon !== 'None') {
    if (actionVariant === 'Icon Only') {
      // Icon-Only variant uses a single icon property - different for each size
      let iconPropertyName = "Select Icon#12307:1"; // Default to Large
      switch (buttonProps.Size) {
        case 'Small':
          iconPropertyName = "Select Icon#12307:2";
          break;
        case 'Medium (Default)':
          iconPropertyName = "Select Icon#12307:3";
          break;
        case 'Large':
          iconPropertyName = "Select Icon#12307:1";
          break;
        default:
          iconPropertyName = "Select Icon#12307:3"; // Default to Medium
      }
      
      iconMapping = {
        source: buttonProps['Icon Instance'],
        targetIconOnly: iconPropertyName,
        targetLeft: null,
        targetRight: null
      };
      console.log('✅ Icon-Only mapping created:', iconMapping);
    } else {
      // Text and Icons variant uses separate left/right icon properties
      // If neither left nor right is specified but icon exists, default to left
      const targetLeft = showLeftIcon || (!showLeftIcon && !showRightIcon) ? "Select 'Left' Icon#12538:1" : null;
      const targetRight = showRightIcon ? "Select 'Right' Icon#12538:5" : null;
      
      iconMapping = {
        source: buttonProps['Icon Instance'],
        targetIconOnly: null,
        targetLeft: targetLeft,
        targetRight: targetRight
      };
      console.log('✅ Text and Icons mapping created:', iconMapping);
    }
  } else {
    console.log('❌ Icon mapping not created - requirements not met');
  }

  // Determine theme mode based on Button color
  let themeMode: string | undefined;
  switch (buttonProps.Color) {
    case '🟣 Asurion Purple':
    case 'Asurion Purple':
      themeMode = 'Asurion - Light';
      console.log('🎨 Theme: Keeping Asurion branding (Light mode)');
      break;
    case '⚪️ White':
    case 'White':
      themeMode = 'Asurion - Dark';
      console.log('🎨 Theme: Keeping Asurion branding (Dark mode)');
      break;
    case '⚫️ Black':
    case 'Black':
      themeMode = 'Partner - Light';
      console.log('🎨 Theme: Removing branding for Partner (Light mode)');
      break;
    default:
      console.log(`⚠️ Unknown Button color: ${buttonProps.Color}, keeping default theme`);
      warnings.push(`Unknown Button color: ${buttonProps.Color}. Theme not changed.`);
      break;
  }

  return {
    actionProps,
    warnings,
    iconMapping,
    themeMode
  };
}

// Optional: Export test cases for future testing
export const testCases = [
  {
    name: 'Filled Primary Button with Left Icon',
    input: { Variant: 'Filled', Size: 'Medium (Default)', State: 'Default', Icon: 'Left', Color: 'Asurion Purple', Label: 'Click me', 'Icon Instance': {} },
    expected: { _variant: 'Text and Icons', Style: 'Filled', State: 'Enabled', Size: 'Medium (Default)', "Show 'Left icon'": true, Label: 'Click me' }
  },
  {
    name: 'Outlined Disabled Large Icon Only',
    input: { Variant: 'Outlined', Size: 'Large', State: 'Disabled', Icon: 'Icon only', Color: 'Black', Label: '', 'Icon Instance': {} },
    expected: { _variant: 'Icon Only', Style: 'Outlined', State: 'Disabled', Size: 'Large (L)' },
    warnings: ["Color \"Black\" is not mapped..."]
  },
  {
    name: 'Flat Text Button (No Icons)',
    input: { Variant: 'Flat', Size: 'Small', State: 'Hover', Icon: 'None', Color: 'White', Label: 'Submit', 'Icon Instance': {} },
    expected: { _variant: 'Text', Style: 'Text', State: 'Hovered', Size: 'Small (S)', Label: 'Submit' },
    warnings: ["Color \"White\" is not mapped..."]
  }
  // ... more test cases can be added
]; 