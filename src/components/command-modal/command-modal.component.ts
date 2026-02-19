import { ChangeDetectionStrategy, Component, output, inject, input } from '@angular/core';
import { IconService } from '../../services/icon.service';

interface Command {
  keys: string[];
  description: string;
}

interface CommandCategory {
  category: string;
  commands: Command[];
}

@Component({
  selector: 'app-command-modal',
  standalone: true,
  imports: [],
  templateUrl: './command-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandModalComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  iconService = inject(IconService);

  commandList: CommandCategory[] = [
    {
      category: 'Global',
      commands: [
        { keys: ['⌘', 'K'], description: 'Open command search' },
        { keys: ['⌘', '/'], description: 'Show this help menu' },
        { keys: ['ESC'], description: 'Close any open modal' },
      ],
    },
    {
      category: 'Quote & Template Editor',
      commands: [
        { keys: ['⌘', 'S'], description: 'Save all changes' },
        { keys: ['⌘', 'Shift', 'S'], description: 'Add a new section (Quote only)' },
      ],
    },
  ];

  isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  constructor() {
    if (!this.isMac) {
      this.commandList = JSON.parse(JSON.stringify(this.commandList).replace(/⌘/g, 'Ctrl'));
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
