# REST API Theme System Setup Guide

## 🎯 Overview

Your AUI Compass plugin now uses the **Figma REST API** to access theme variables across different files, solving the cross-file theming challenge. This approach is robust and scalable for your library-dependent functionalities.

## 🚀 **How It Works**

The plugin uses a **3-tier approach**:

1. **🏠 Local First**: Checks for theme collections in the current file (fastest)
2. **🌐 REST API**: Accesses theme collections from your foundations library via API
3. **🔄 Fallback**: Uses team library approach as backup

## ⚙️ **Setup Required**

### **Step 1: Verify Your .env Setup** ✅

Since you already have `.env` configured with `FIGMA_PAT`, you're all set! The plugin will automatically use your existing token.

### **Step 2: Get Your Foundations File Key**

1. **Open your foundations library** in Figma
2. **Copy the file key** from the URL:
   ```
   https://www.figma.com/design/[FILE_KEY]/Your-Foundation-Library
                                ^^^^^^^^
   ```

### **Step 3: Configure the Plugin**

Edit this line in `src/code.ts` (around line 58):

```typescript
// Replace with your actual foundations file key
const foundationsFileKey = 'your-foundations-file-key';
```

### **Step 4: Rebuild and Test**

```bash
npm run build
```

Reload the plugin in Figma and test the theming!

## 🎨 **Theme Mapping Reference**

| Button Color | Theme Applied |
|-------------|---------------|
| 🟣 **Asurion Purple** | `Asurion - Light` |
| ⚪️ **White** | `Asurion - Dark` |
| ⚫️ **Black** | `Partner - Light` |

## 🔧 **How the API System Works**

### **Local Collection Detection**
```typescript
// First, tries to find local theme collections
const localThemeCollection = localCollections.find(collection => 
  collection.name === 'System Tokens and Themes' ||
  collection.modes.some(mode => 
    ['Asurion - Light', 'Asurion - Dark', 'Partner - Light', 'Partner - Dark'].includes(mode.name)
  )
);
```

### **REST API Call**
```typescript
// Makes API call to foundations library
const response = await fetch(`https://api.figma.com/v1/files/${foundationsFileKey}/variables/local`, {
  headers: { 'X-Figma-Token': 'your-token' }
});
```

### **Theme Application**
```typescript
// Applies theme mode to Action component
instance.setExplicitVariableModeForCollection(collection, targetMode.modeId);
```

## 🛡️ **Security Best Practices**

### **For Development:**
- Store token in `src/code.ts` temporarily for testing
- **Never commit tokens to version control**

### **For Production:**
Consider these approaches:
- **Environment variables** in your build process
- **Plugin parameters** for user-provided tokens
- **OAuth flow** for enterprise deployment

## 📊 **Expected Log Output**

When working correctly, you'll see:
```
🎨 Starting REST API theme application for: Partner - Light
🔍 No local theme collection found, trying REST API approach...
📡 Making REST API call for file: your-file-key
📊 REST API response received: {meta: {variableCollections: ...}}
✅ Found theme collection via API: "System Tokens and Themes"
✅ Applied theme via REST API: "Partner - Light" (mode-id)
```

## 🚨 **Troubleshooting**

### **"Cannot access file key"**
- Check `enablePrivatePluginApi: true` in manifest.json
- Ensure plugin has proper permissions

### **"REST API failed: 401"**
- Verify your personal access token is correct
- Check token hasn't expired

### **"No theme collection found in REST API response"**
- Verify the foundations file key is correct
- Check that the file contains "System Tokens and Themes" collection

### **Network Access Issues**
- Ensure `"allowedDomains": ["https://api.figma.com"]` in manifest.json
- Check if corporate firewall blocks api.figma.com

## 🎯 **Future Enhancements**

This REST API foundation enables:
- **Cross-file component discovery**
- **Library asset synchronization**  
- **Automated style migration**
- **Design token management**
- **Enterprise integrations**

## 🔗 **Related Documentation**

- [Figma REST API Variables](https://www.figma.com/developers/api#variables)
- [Personal Access Tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)
- [Plugin Network Access](https://www.figma.com/plugin-docs/manifest/#networkaccess) 