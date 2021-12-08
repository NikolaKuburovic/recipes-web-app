import { Directive, ElementRef, HostBinding, HostListener, Renderer2 } from "@angular/core";

@Directive({
    selector: '[appDropdown]',
})

export class DropdownDirective{


    @HostBinding('class.open') isOpen = false;
    
    @HostListener('document:click', ['$event']) menuOpen(event: Event){
        this.isOpen = this.el.nativeElement.contains(event.target) ? !this.isOpen: false;
    }
    constructor(private el: ElementRef){}
}