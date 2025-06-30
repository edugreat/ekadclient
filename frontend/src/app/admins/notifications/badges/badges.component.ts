import { Component } from '@angular/core';
import { DocsExampleComponent } from '../../../components/docs-example/docs-example.component';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, BadgeComponent, ButtonDirective, BorderDirective } from '@coreui/angular';

@Component({
    selector: 'app-badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss'],
    imports: [RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, BadgeComponent, ButtonDirective, BorderDirective]
})
export class BadgesComponent {

  constructor() { }

}
