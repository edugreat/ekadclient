import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsExampleComponent } from '../../../components/docs-example/docs-example.component';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TooltipDirective, ButtonDirective } from '@coreui/angular';

@Component({
    selector: 'app-tooltips',
    templateUrl: './tooltips.component.html',
    styleUrls: ['./tooltips.component.scss'],
    imports: [RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TooltipDirective, RouterLink, ButtonDirective]
})
export class TooltipsComponent {

  constructor() { }

}
