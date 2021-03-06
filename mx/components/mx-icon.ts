// mx-icon
// by The Mimix Company

// Provides access to SVG icon sets

//Lit Dependencies
import { html, css, svg, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//Icon SVG Sets & Alternate Names
import * as fa from 'icons/fa-icons';
import * as alt from 'icons/fa-icon-index';

//<mx-icon>
//Returns an icon from an SVG set

@customElement('mx-icon')
export class mxIcon extends LitElement {

    static styles = css`
    .icon {
        padding-left: 0.1em;
        padding-right: 0.1em;
        vertical-align: -0.125em;
      }
   
    `;

    //PUBLIC PROPERTIES
    @property() color: string = "currentColor"
    @property() size: number = 1;
    @property() viewBox: string;
    @property() title: string;
    @property() class: string;

    //PRIVATE PROPERTIES

    //Index of Alternate Icon Names for FontAwesome
    indexOfNames = {};

    //Setup for Run Once
    hasRun = false;

    //Provide an index for FontAwesome alternate icon names
    createNameIndex = function () {

        //Walk through all the icon sets
        for (let iconSetKey in fa) {

            //Get one icon set
            let iconSet = fa[iconSetKey];

            //Walk through all icons in that set
            for (let iconKey in iconSet) {

                //Get one icon
                let icon = iconSet[iconKey];

                //Destructure array to find alternate names
                let [, , alternateNamesArray] = icon;

                //If alternate names were provided...
                if (alternateNamesArray) {

                    //Walk through all alternate names
                    for (let alternameName of alternateNamesArray) {

                        //Add alternate name to master list as a pointer to originalName
                        this.indexOfNames[alternameName] = iconKey;
                    }
                }
            }
        }
    }

    //Show this component on screen
    render() {

        //BEFORE TEMPLATE

        //Run Once

        if (!this.hasRun) {

            // this.createNameIndex();
            // console.log("created index");

            //Remember we ran once
            this.hasRun = true;

        }

        //Setup for finding font in class
        let classAttribute = this.class

        //Remove fa-
        classAttribute = classAttribute.replace("fa-", ""); //class="fas fa-alien" => class="fas alien";

        //Destructure class to find icon set and name
        let [set, name] = classAttribute.split(" ");

        //Default to "fas" set if not specified
        if (name == undefined) {
            name = set;
            set = "fas";
        }

        //Retrieve icon from set by regular or alternate name
        let matchingIcon: any[];

        //Check if this is an alternate name
        let alternateName = alt.names[name];

        //If alternate, convert to original
        if (alternateName) {
            matchingIcon = fa[set][alternateName];
        } else {
            matchingIcon = fa[set][name];
        }

        //Get icon info (array) from fa set

        //Handle matchingIcon not found (by name or alternate) with red triangle bang
        if (!matchingIcon) {
            matchingIcon = fa.fas["triangle-exclamation"];
            this.color = "#ec2026";
            this.title = `Could not find icon "${this.class}".`
        }

        //Destructure array to find SVG info
        let [width, height, , , dValue] = matchingIcon;

        //Build viewBox value with width and height
        let viewBox = `0 0 ${width} ${height}`

        //Create SVG
        let svgPart = svg`
        <svg viewBox=${viewBox} class="${this.class} icon" style="height:${this.size}em; width:${this.size}em;">
            <path style="fill:${this.color}" d="${dValue}"></path>
            <title>${this.title}</title>
        </svg>
        `

        //Return SVG
        return html`
        ${svgPart}
        `
    }

}
