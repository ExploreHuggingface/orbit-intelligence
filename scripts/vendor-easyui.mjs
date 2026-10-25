// Vendors selected EasyUI components (https://github.com/Surajmaurya1/easyui)
// into components/easyui/, rewriting relative lib imports to @/lib/easyui/*.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.env.EASYUI_SRC;
const DEST_LIB = join(process.cwd(), 'lib', 'easyui');
const DEST_UI = join(process.cwd(), 'components', 'easyui');

const LIB_FILES = ['utils.ts', 'motion-tokens.ts', 'dashboard-chart-utils.ts', 'chart-primitives.tsx'];
const HOOK_FILES = ['useFocusTrap.ts'];
const COMPONENTS = [
  // primitives
  'Button.tsx', 'badge.tsx', 'alert.tsx', 'skeleton.tsx', 'sheet.tsx', 'sidebar.tsx',
  'stepper.tsx', 'breadcrumb.tsx', 'Loader.tsx', 'OrbitalLoadingRing.tsx', 'AnimatedTabs.tsx',
  'PillNavigation.tsx', 'SmoothAccordion.tsx', 'DirectionalTooltip.tsx', 'SplitButton.tsx',
  'OriginDropdown.tsx', 'MorphingDialog.tsx', 'SpringSelect.tsx', 'StretchSwitch.tsx', 'DrawCheckbox.tsx',
  'Form.tsx',
  // data display
  'StatCard.tsx', 'AnimatedNumber.tsx', 'MetricHUD.tsx', 'AdvancedDataTable.tsx', 'ActivityFeed.tsx',
  'ActivityHeatmap.tsx', 'MoneyCard.tsx', 'ExpandableDataRow.tsx', 'InteractiveAreaChart.tsx',
  'LiveLineChart.tsx', 'BarChart.tsx', 'DonutChart.tsx', 'PaymentStatus.tsx',
  // feedback
  'NotificationBell.tsx', 'NotificationStack.tsx', 'UndoToast.tsx', 'VelocityToast.tsx',
  // marketing
  'RevealCard.tsx', 'SpotlightCard.tsx', 'StoryCard.tsx', 'ProfileCard.tsx', 'TypewriterButton.tsx',
  'TextScrambleDecoder.tsx', 'ScrollProgressNav.tsx', 'MorphingMegaMenu.tsx', 'Pricing.tsx', 'FAQ.tsx',
  'Login.tsx', 'SignUp.tsx', 'InteractiveTimeline.tsx', 'SparklesCore.tsx', 'CircularOrbit.tsx',
  'DotField.tsx', 'DotField.css', 'GlitchText.tsx', 'Scrollvelocitytext.tsx',
];

const IMPORT_REWRITES = [
  [/(['"])(\.\.\/)+lib\/utils\1/g, "$1@/lib/easyui/utils$1"],
  [/(['"])(\.\.\/)+lib\/motion-tokens\1/g, "$1@/lib/easyui/motion-tokens$1"],
  [/(['"])(\.\.\/)+lib\/chart-primitives\1/g, "$1@/lib/easyui/chart-primitives$1"],
  [/(['"])(\.\.\/)+lib\/dashboard-chart-utils\1/g, "$1@/lib/easyui/dashboard-chart-utils$1"],
  [/(['"])(\.\.\/)+lib\/theme\/useTheme\1/g, "$1@/lib/easyui/theme/use-theme$1"],
  [/(['"])(\.\.\/)+hooks\/useFocusTrap\1/g, "$1@/lib/easyui/hooks/useFocusTrap$1"],
  [/(['"])(\.\.\/)+types\/component\1/g, "$1@/lib/easyui/types/component$1"],
  [/(['"])\.\/DotField\.css\1/g, "$1./dot-field.css$1"],
];

if (!SRC) {
  console.error('Set EASYUI_SRC to the easyui src directory');
  process.exit(1);
}

mkdirSync(join(DEST_LIB, 'hooks'), { recursive: true });
mkdirSync(join(DEST_LIB, 'theme'), { recursive: true });
mkdirSync(join(DEST_LIB, 'types'), { recursive: true });
mkdirSync(DEST_UI, { recursive: true });

for (const f of LIB_FILES) copyFileSync(join(SRC, 'lib', f), join(DEST_LIB, f));
for (const f of HOOK_FILES) copyFileSync(join(SRC, 'lib', 'hooks', f), join(DEST_LIB, 'hooks', f));
copyFileSync(join(SRC, 'lib', 'theme', 'useTheme.tsx'), join(DEST_LIB, 'theme', 'use-theme.tsx'));
copyFileSync(join(SRC, 'types', 'component.ts'), join(DEST_LIB, 'types', 'component.ts'))
  if (existsSync(join(SRC, 'types', 'component.d.ts'))) copyFileSync(join(SRC, 'types', 'component.d.ts'), join(DEST_LIB, 'types', 'component.d.ts'));

let ok = 0, failed = [];
for (const f of COMPONENTS) {
  const srcPath = join(SRC, 'components', 'ui', f);
  if (!existsSync(srcPath)) { failed.push(f + ' (missing)'); continue; }
  let code = readFileSync(srcPath, 'utf8');
  for (const [re, sub] of IMPORT_REWRITES) code = code.replace(re, sub);
  if (!/^['"]use client['"]/.test(code.trimStart()) && f.endsWith('.tsx')) {
    code = "'use client';\n\n" + code;
  }
  // DotField.css keeps its own name mapping
  const outName = f === 'DotField.css' ? 'dot-field.css' : f;
  writeFileSync(join(DEST_UI, outName), code);
  ok++;
}
console.log(`vendored ${ok} files${failed.length ? '; FAILED: ' + failed.join(', ') : ''}`);
