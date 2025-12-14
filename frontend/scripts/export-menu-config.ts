#!/usr/bin/env ts-node
/**
 * Export Menu Config Script
 *
 * Script untuk mengekspor menuConfig.tsx ke format JSON yang compatible
 * dengan API sync menu di backend (POST /manakses/menu/sync/{idAplikasi})
 *
 * Usage:
 *   npx ts-node scripts/export-menu-config.ts [app-name]
 *
 * Examples:
 *   npx ts-node scripts/export-menu-config.ts                    # Export semua
 *   npx ts-node scripts/export-menu-config.ts manajemen-akses    # Export 1 app
 *
 * Output:
 *   Generates JSON files in scripts/output/ directory
 */

import * as fs from 'fs';
import * as path from 'path';

// Type definitions for menu
interface MenuItem {
  title: string;
  icon?: string; // Will be extracted as string from JSX
  href?: string;
  children?: MenuItem[];
  roles?: string[];
}

interface MenuExport {
  nm_menu: string;
  nm_file: string | null;
  icon: string | null;
  urutan_menu: number;
  level_menu: number;
  a_aktif: boolean;
  a_tampil: boolean;
  children?: MenuExport[];
}

interface AppMenuConfig {
  appSlug: string;
  appName: string;
  configPath: string;
  exportName: string;
}

// App configurations - maps app slug to its menuConfig location
const APP_CONFIGS: AppMenuConfig[] = [
  {
    appSlug: 'manajemen-akses',
    appName: 'Manajemen Akses',
    configPath: 'src/app/dashboard/manajemen-akses/config/menuConfig.tsx',
    exportName: 'manajemenAksesMenuConfig'
  },
  {
    appSlug: 'siakadu',
    appName: 'SIAKADU',
    configPath: 'src/app/dashboard/siakadu/config/menuConfig.tsx',
    exportName: 'siakaduMenuConfig'
  },
  {
    appSlug: 'feeder-integrator',
    appName: 'Feeder Integrator',
    configPath: 'src/app/dashboard/feeder-integrator/config/menuConfig.tsx',
    exportName: 'feederIntegratorMenuConfig'
  },
  {
    appSlug: 'sister-integrator',
    appName: 'Sister Integrator',
    configPath: 'src/app/dashboard/sister-integrator/config/menuConfig.tsx',
    exportName: 'sisterIntegratorMenuConfig'
  },
  {
    appSlug: 'myunila-integrator',
    appName: 'MyUnila Integrator',
    configPath: 'src/app/dashboard/integrator/config/menuConfig.tsx',
    exportName: 'myunilaIntegratorMenuConfig'
  },
];

/**
 * Extract icon name from JSX-like string
 * Example: "<MdDashboard className=\"w-5 h-5\" />" => "MdDashboard"
 * Example: "<FiUsers className=\"w-5 h-5\" />" => "FiUsers"
 */
function extractIconName(iconJsx: string | undefined): string | null {
  if (!iconJsx) return null;

  // Match pattern: <IconName or just IconName
  const match = iconJsx.match(/<(\w+)/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Extract nm_file from href
 * Example: "/dashboard/manajemen-akses/manajemen/pengguna" => "manajemen/pengguna"
 */
function extractNmFile(href: string | undefined, appSlug: string): string | null {
  if (!href) return null;

  // Remove the base path /dashboard/{app-slug}
  const basePath = `/dashboard/${appSlug}`;
  if (href.startsWith(basePath)) {
    const remaining = href.substring(basePath.length);
    // Remove leading slash
    return remaining.startsWith('/') ? remaining.substring(1) : remaining || null;
  }

  // For root dashboard, return 'dashboard'
  if (href === `/dashboard/${appSlug}`) {
    return 'dashboard';
  }

  return href;
}

/**
 * Parse menuConfig.tsx file and extract menu items
 */
function parseMenuConfigFile(filePath: string, exportName: string): any[] | null {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Simple regex-based parser for menu items
  // This is a simplified parser - for production, consider using TypeScript compiler API

  const menus: any[] = [];

  // Find the export array
  const exportPattern = new RegExp(`export\\s+const\\s+${exportName}[^=]*=\\s*\\[`, 'g');
  const exportMatch = exportPattern.exec(content);

  if (!exportMatch) {
    console.error(`Export ${exportName} not found in ${filePath}`);
    return null;
  }

  // Parse the array content using a stack-based approach
  let depth = 0;
  let currentItem = '';
  let inString = false;
  let stringChar = '';
  let items: string[] = [];

  const startIndex = exportMatch.index + exportMatch[0].length;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';

    // Track string state
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          currentItem = '{';
        } else {
          currentItem += char;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        currentItem += char;
        if (depth === 0) {
          items.push(currentItem);
          currentItem = '';
        }
      } else if (char === ']' && depth === 0) {
        break;
      } else if (depth > 0) {
        currentItem += char;
      }
    } else if (depth > 0) {
      currentItem += char;
    }
  }

  // Parse each item
  for (const itemStr of items) {
    try {
      const menu = parseMenuItem(itemStr);
      if (menu) {
        menus.push(menu);
      }
    } catch (e) {
      console.error('Error parsing menu item:', e);
    }
  }

  return menus;
}

/**
 * Parse a single menu item string
 */
function parseMenuItem(itemStr: string): any | null {
  const menu: any = {};

  // Extract title
  const titleMatch = itemStr.match(/title:\s*["'`]([^"'`]+)["'`]/);
  if (titleMatch) {
    menu.title = titleMatch[1];
  }

  // Extract href
  const hrefMatch = itemStr.match(/href:\s*["'`]([^"'`]+)["'`]/);
  if (hrefMatch) {
    menu.href = hrefMatch[1];
  }

  // Extract icon (as JSX string)
  const iconMatch = itemStr.match(/icon:\s*(<[^>]+\/>)/);
  if (iconMatch) {
    menu.iconJsx = iconMatch[1];
  }

  // Extract roles
  const rolesMatch = itemStr.match(/roles:\s*\[([^\]]+)\]/);
  if (rolesMatch) {
    const rolesStr = rolesMatch[1];
    menu.roles = rolesStr.match(/["'`]([^"'`]+)["'`]/g)?.map(r => r.replace(/["'`]/g, '')) || [];
  }

  // Extract children
  const childrenMatch = itemStr.match(/children:\s*\[/);
  if (childrenMatch) {
    // Find the children array
    const childStart = itemStr.indexOf('children:') + 'children:'.length;
    let childDepth = 0;
    let childContent = '';
    let inChildString = false;
    let childStringChar = '';

    for (let i = childStart; i < itemStr.length; i++) {
      const char = itemStr[i];
      const prevChar = i > 0 ? itemStr[i - 1] : '';

      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inChildString) {
          inChildString = true;
          childStringChar = char;
        } else if (char === childStringChar) {
          inChildString = false;
        }
      }

      if (!inChildString) {
        if (char === '[') {
          childDepth++;
          if (childDepth === 1) continue;
        } else if (char === ']') {
          childDepth--;
          if (childDepth === 0) break;
        }
      }

      if (childDepth > 0) {
        childContent += char;
      }
    }

    // Parse child items
    const childItems: string[] = [];
    let cDepth = 0;
    let cItem = '';
    let cInString = false;
    let cStringChar = '';

    for (let i = 0; i < childContent.length; i++) {
      const char = childContent[i];
      const prevChar = i > 0 ? childContent[i - 1] : '';

      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!cInString) {
          cInString = true;
          cStringChar = char;
        } else if (char === cStringChar) {
          cInString = false;
        }
      }

      if (!cInString) {
        if (char === '{') {
          if (cDepth === 0) {
            cItem = '{';
          } else {
            cItem += char;
          }
          cDepth++;
        } else if (char === '}') {
          cDepth--;
          cItem += char;
          if (cDepth === 0) {
            childItems.push(cItem);
            cItem = '';
          }
        } else if (cDepth > 0) {
          cItem += char;
        }
      } else if (cDepth > 0) {
        cItem += char;
      }
    }

    menu.children = childItems.map(c => parseMenuItem(c)).filter(c => c !== null);
  }

  return menu.title ? menu : null;
}

/**
 * Convert parsed menu to export format
 */
function convertToExportFormat(menus: any[], appSlug: string, level: number = 0): MenuExport[] {
  return menus.map((menu, index) => {
    const exported: MenuExport = {
      nm_menu: menu.title,
      nm_file: extractNmFile(menu.href, appSlug),
      icon: extractIconName(menu.iconJsx),
      urutan_menu: index + 1,
      level_menu: level,
      a_aktif: true,
      a_tampil: true,
    };

    if (menu.children && menu.children.length > 0) {
      exported.children = convertToExportFormat(menu.children, appSlug, level + 1);
    }

    return exported;
  });
}

/**
 * Export menu config for a single app
 */
function exportAppMenuConfig(config: AppMenuConfig, outputDir: string): boolean {
  console.log(`\nProcessing: ${config.appName} (${config.appSlug})`);

  const fullPath = path.join(process.cwd(), config.configPath);
  const menus = parseMenuConfigFile(fullPath, config.exportName);

  if (!menus || menus.length === 0) {
    console.error(`  Failed to parse menu config`);
    return false;
  }

  const exportedMenus = convertToExportFormat(menus, config.appSlug);

  const output = {
    app_slug: config.appSlug,
    app_name: config.appName,
    exported_at: new Date().toISOString(),
    total_menus: countMenus(exportedMenus),
    menus: exportedMenus,
  };

  const outputPath = path.join(outputDir, `${config.appSlug}-menus.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`  Exported ${output.total_menus} menus to ${outputPath}`);
  return true;
}

/**
 * Count total menus including children
 */
function countMenus(menus: MenuExport[]): number {
  let count = menus.length;
  for (const menu of menus) {
    if (menu.children) {
      count += countMenus(menu.children);
    }
  }
  return count;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const targetApp = args[0];

  // Create output directory
  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('Menu Config Export Script');
  console.log('='.repeat(60));

  let configs = APP_CONFIGS;

  if (targetApp) {
    const found = APP_CONFIGS.find(c => c.appSlug === targetApp);
    if (!found) {
      console.error(`\nApp not found: ${targetApp}`);
      console.log('\nAvailable apps:');
      APP_CONFIGS.forEach(c => console.log(`  - ${c.appSlug}`));
      process.exit(1);
    }
    configs = [found];
  }

  let successCount = 0;

  for (const config of configs) {
    if (exportAppMenuConfig(config, outputDir)) {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Completed: ${successCount}/${configs.length} apps exported`);
  console.log(`Output directory: ${outputDir}`);
  console.log('='.repeat(60));

  // Generate combined output for API sync
  if (configs.length > 1) {
    const combined: any = {
      exported_at: new Date().toISOString(),
      apps: {}
    };

    for (const config of configs) {
      const jsonPath = path.join(outputDir, `${config.appSlug}-menus.json`);
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        combined.apps[config.appSlug] = data;
      }
    }

    const combinedPath = path.join(outputDir, 'all-menus.json');
    fs.writeFileSync(combinedPath, JSON.stringify(combined, null, 2));
    console.log(`\nCombined output: ${combinedPath}`);
  }
}

main();
