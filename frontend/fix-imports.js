const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /@\/lib\/api/g, to: '@/shared/api' },
  { from: /@\/lib\/hooks/g, to: '@/shared/hooks' },
  { from: /@\/lib\/utils/g, to: '@/shared/utils' },
  { from: /@\/lib\/constants/g, to: '@/shared/constants' },
  { from: /@\/lib\/types/g, to: '@/shared/types' },
  { from: /@\/components\/ui/g, to: '@/shared/components/ui' },
  { from: /@\/components\/layout/g, to: '@/shared/components/layouts' },
  { from: /@\/components\/common/g, to: '@/shared/components/ui/common' },
  { from: /@\/components\/tentang/g, to: '@/modules/public/components/tentang' },
  { from: /@\/components\/statistik/g, to: '@/modules/public/components/statistik' },
  { from: /@\/components\/akademik/g, to: '@/modules/public/components/akademik' },
  { from: /@\/components\/auth/g, to: '@/modules/auth/components' },
  { from: /@\/contexts\/AuthContext/g, to: '@/modules/auth/hooks/useAuth' },
  { from: /from ['"]@\/contexts\/AuthContext['"]/g, to: "from '@/modules/auth/hooks/useAuth'" },
];

let totalFiles = 0;
let modifiedFiles = 0;

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];
    
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        modified = true;
        changes.push(`  ${from} → ${to}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`\n✓ Updated: ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(change));
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir, excludeDirs = ['node_modules', '.next', '.git']) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(file)) {
            walkDir(filePath, excludeDirs);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          updateImports(filePath);
        }
      } catch (error) {
        console.error(`✗ Error accessing ${filePath}:`, error.message);
      }
    });
  } catch (error) {
    console.error(`✗ Error reading directory ${dir}:`, error.message);
  }
}

console.log('╔════════════════════════════════════════════════════╗');
console.log('║     UNILA PORTAL - AUTO IMPORT FIXER              ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log('Starting import updates...\n');

const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
} else {
  console.error('✗ Error: src directory not found!');
  process.exit(1);
}

// Also check root files
const rootFiles = ['middleware.ts', 'middleware.js'];
rootFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    updateImports(filePath);
  }
});

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║                   SUMMARY                          ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\nTotal files scanned: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
console.log(`Files unchanged: ${totalFiles - modifiedFiles}\n`);

if (modifiedFiles > 0) {
  console.log('✅ Import updates completed successfully!\n');
  console.log('Next steps:');
  console.log('  1. Review the changes');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npx tsc --noEmit (to check for errors)');
  console.log('  4. Run: npm run dev\n');
} else {
  console.log('ℹ️  No files needed updating.\n');
}
