// Explicit per-icon imports: no dynamic catalog loader or package-wide barrel.
import Bell from 'lucide-react/icons/bell';
import Check from 'lucide-react/icons/check';
import ArrowUpRight from 'lucide-react/icons/arrow-up-right';
import {ChartLineUpIcon} from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import {PlayCircleIcon} from '@phosphor-icons/react/dist/ssr/PlayCircle';
import {createIconRegistry} from '@code-to-video/ui/icons';
import {lucideIcon, phosphorIcon, pathIcon} from '@code-to-video/ui/icons/adapters';

export const showcaseIcons = createIconRegistry([
  lucideIcon('bell', Bell), lucideIcon('check', Check), lucideIcon('arrow-up-right', ArrowUpRight),
  phosphorIcon('chart-line-up', ChartLineUpIcon), phosphorIcon('play-circle', PlayCircleIcon),
  pathIcon('signal-mark', ['M12 3 L21 12 L12 21 L3 12 Z', 'M8 12 L11 15 L16 9']),
]);
showcaseIcons.seal();
