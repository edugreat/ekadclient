import { Injectable } from '@angular/core';
import { MathJaxConfig } from '../util/mathjax-config';


declare global {
  interface Window {
    MathJax:any;
  }
}


@Injectable({
  providedIn: 'root'
})
export class MathJaxService {

  private mathJaxLoaded = false;

  constructor() {
    this.loadMathJax();
   }

  private loadMathJax() {

    if(typeof window !== 'undefined' && !this.mathJaxLoaded){

      const script = document.createElement('script');

      script.text = `window.MathJax=${JSON.stringify(MathJaxConfig)}`;

      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;

      script.onload = () => {

        this.mathJaxLoaded = true;

        window.MathJax.startup.promise.then(() => {

         
        })
      };
      document.head.appendChild(script);
    }
  }

  typeset (element?:HTMLElement):Promise<void>{

    if(!this.mathJaxLoaded){

      return Promise.resolve();
    }

    return window.MathJax.typesetPromise(element ? [element] : undefined)
  }
}
