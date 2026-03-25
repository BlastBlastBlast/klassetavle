import type { Widget } from '../../store/boardStore'
import { Trafikklys } from '../widgets/Trafikklys'
import { Tekst } from '../widgets/Tekst'
import { Bilde } from '../widgets/Bilde'
import { Klokke } from '../widgets/Klokke'
import { Terning } from '../widgets/Terning'
import { Timer } from '../widgets/Timer'
import { Snurrehjul } from '../widgets/Snurrehjul'
import { Tegning } from '../widgets/Tegning'
import { Bakgrunn } from '../widgets/Bakgrunn'
import { Gestu } from '../widgets/Gestu'

export function WidgetRenderer({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'trafikklys': return <Trafikklys widget={widget} />
    case 'tekst':      return <Tekst widget={widget} />
    case 'bilde':      return <Bilde widget={widget} />
    case 'klokke':     return <Klokke widget={widget} />
    case 'terning':    return <Terning widget={widget} />
    case 'timer':      return <Timer widget={widget} />
    case 'snurrehjul': return <Snurrehjul widget={widget} />
    case 'tegning':    return <Tegning widget={widget} />
    case 'bakgrunn':   return <Bakgrunn widget={widget} />
    case 'gestu':      return <Gestu widget={widget} />
    default:           return null
  }
}
