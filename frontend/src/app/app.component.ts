import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    template: '<router-outlet />',
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Ekademiks Assessment Platform';

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);

  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);

  private authService = inject(AuthService)

  private currentUser = toSignal(this.authService.currentUserOb$);

  

  constructor() {

   
    this.#titleService.setTitle(this.title);
    // iconSet singleton
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('coreui-free-angular-admin-template-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
    
   
  
  
  }

 

  ngOnInit(): void {
   

    const userId = sessionStorage.getItem('userId');
    if(userId){
    
      this.authService.setReloadState(false);

      this.authService.getCachedUser(userId).subscribe({
        error:() => {

          //this.authService.setReloadState(true);

           sessionStorage.clear();
        },

        complete:() => {
          sessionStorage.clear();
         this.authService.setReloadState(true);
        }
      })
    }

    this.#router.events.pipe(
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  @HostListener('window:beforeunload',['$event'])
  beforeUnload($event:any){

   if(this.currentUser()){
    console.log('before unload')
    this.authService.setReloadState(false)

    sessionStorage.setItem('userId',String(this.currentUser()!.id));
   }
  }

}
