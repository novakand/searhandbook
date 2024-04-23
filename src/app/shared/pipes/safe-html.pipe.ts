import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeHtml',
  pure: true,
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  public transform(html): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
