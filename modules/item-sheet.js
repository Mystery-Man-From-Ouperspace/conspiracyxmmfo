export class conspiracyxItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // classes: ["conspiracyx", "sheet", "item", `${game.settings.get("conspiracyx", "light-mode") ? "light-mode" : ""}`],
            classes: ["conspiracyx", "sheet", "item"],
            width: 600,
            height: 450,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body-items", initial: "description"}]
        })
    }

    /* -------------------------------------------- */

    /** @override */
    get template() {
        const path = "systems/conspiracyx/templates";
        return `${path}/${this.item.type}-sheet.html`;
    }

    async getData() {
        const data = super.getData(); 
        data.dtypes = ["String", "Number", "Boolean"];
        data.isGM = game.user.isGM;
        data.editable = data.options.editable;
        const itemData = data.system;
        data.data = itemData;

        data.descriptionHTML = await TextEditor.enrichHTML(data.item.system.description, {
            async: false
          })

        return data;
        }

/* -------------------------------------------- */

    /** @override */
    setPosition(options={}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /**
   * Handle clickables
   * @param {Event} event   The originating click event
   * @private
   */



}
