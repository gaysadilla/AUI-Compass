// Button to Action Complete Mapping Configuration

export interface ButtonProperties {
  Variant: 'Filled' | 'Outlined' | 'Flat';
  Size: 'Small' | 'Medium (Default)' | 'Large';
  State: 'Default' | 'Hover' | 'Pressed' | 'Disabled';
  Icon: 'None' | 'Left' | 'Right' | 'Icon only';
  Color: 'Asurion Purple' | 'Black' | 'White';
  Label: string;
  'Icon Instance': any; // Component instance
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

export function mapButtonToAction(buttonProps: ButtonProperties): {
  actionProps: ActionProperties;
  warnings: string[];
  iconMapping: { source: any; target: 'left' | 'right' | 'icon' } | null;
} {
  const warnings: string[] = [];
  const variant = determineActionVariant(buttonProps);
  const actionProps: ActionProperties = {
    _variant: variant as ActionProperties['_variant'],
    Style: buttonToActionMapping.propertyMappings.style(buttonProps.Variant) as ActionProperties['Style'],
    State: buttonToActionMapping.propertyMappings.state(buttonProps.State) as ActionProperties['State'],
    Size: buttonToActionMapping.propertyMappings.size(buttonProps.Size) as ActionProperties['Size']
  };
  if (variant === 'Icon Only') {
    // Icon Only variant doesn't need label or show icon properties
  } else if (variant === 'Text') {
    actionProps.Label = buttonProps.Label;
  } else if (variant === 'Text and Icons') {
    const iconConfig = buttonToActionMapping.propertyMappings.iconConfig(buttonProps.Icon);
    Object.assign(actionProps, iconConfig);
    actionProps.Label = buttonProps.Label;
  }
  const colorResult = buttonToActionMapping.colorHandling(buttonProps.Color);
  if (colorResult.warning) {
    warnings.push(colorResult.warning);
  }
  let iconMapping: { source: any; target: 'left' | 'right' | 'icon' } | null = null;
  if (buttonProps['Icon Instance']) {
    if (buttonProps.Icon === 'Left') {
      iconMapping = { source: buttonProps['Icon Instance'], target: 'left' };
    } else if (buttonProps.Icon === 'Right') {
      iconMapping = { source: buttonProps['Icon Instance'], target: 'right' };
    } else if (buttonProps.Icon === 'Icon only') {
      iconMapping = { source: buttonProps['Icon Instance'], target: 'icon' };
    }
  }
  return {
    actionProps,
    warnings,
    iconMapping
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