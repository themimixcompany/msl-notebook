// mx-icon
// by The Mimix Company

// Provides access to SVG icon sets

//Lit Dependencies
import { html, css, svg, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//Icon SVG Sets
import * as fa from 'icons/fa-icons'

//<mx-icon>
//Returns an icon from an SVG set

@customElement('mx-icon')
export class mxIcon extends LitElement {

    static styles = css`
    .icon {
        padding-left: 0.2em;
        padding-right: 0.2em;
        vertical-align: -0.125em;
      }
    `;

    //PUBLIC PROPERTIES
    @property() class: string;
    @property() color: string;
    @property() size: number = 1;
    @property() viewBox: string;
   

    //Show this component on screen
    render() {
        //console.log(onclick);
        //Remove "fa-" from class
        this.class = this.class.replace("fa-","");

        //Destructure class to find icon set and name
        let [set, name] = this.class.split(" ");

        //Retrieve icon from set
        let matchingIcon:any[];
        matchingIcon = fa[set][name];
        
        //Destructure array to find SVG info
        let [width, height, , , dValue] = matchingIcon;

        //Build viewBox with width and height
        let viewBox = `0 0 ${width} ${height}`

        //Create SVG
        let svgPart = svg`
        <svg viewBox=${viewBox} class="icon" style="height:${this.size}em;width:${this.size}em"><path style="fill:${this.color}" d=${dValue}></svg>
        `

        //Return SVG
        return html`
        ${svgPart}
        `

    }

}







