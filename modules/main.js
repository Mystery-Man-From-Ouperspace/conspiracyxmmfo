// Import Modules
import { conspiracyxActorSheet } from "./actor-sheet.js";
import { conspiracyxActor } from "./actor.js";
import { conspiracyxItem } from "./item.js";
import { conspiracyxItemSheet } from "./item-sheet.js";
import { conspiracyxCellSheet } from "./cell-sheet.js"
import { conspiracyxCreatureSheet } from "./creature-sheet.js"
import { conspiracyxVehicleSheet } from "./vehicle-sheet.js"
import { registerHandlebarsHelpers } from "./helpers.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
    console.log(`Initializing CONX System`);

    /**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
        formula: "1d10 + @initiative.value",
        decimals: 0
      };

      
      // Register Handlebars Helpers
      registerHandlebarsHelpers();


      // Define Custom Entity Classes
      CONFIG.Actor.documentClass = conspiracyxActor
      CONFIG.Item.documentClass = conspiracyxItem

      // Register sheet application classes
      Actors.unregisterSheet("core", ActorSheet)

      Actors.registerSheet("conspiracyx", conspiracyxActorSheet, 
      {
          types: ["character"],
          makeDefault: true,
          label: "Default CONX Character Sheet"
      })

      Actors.registerSheet("conspiracyx", conspiracyxCreatureSheet, 
      {
          types: ["creature"],
          makeDefault: true,
          label: "Default CONX Creature Sheet"
      })

      Actors.registerSheet("conspiracyx", conspiracyxCellSheet, 
      {
          types: ["cell"],
          makeDefault: true,
          label: "Default CONX Cell Sheet"
      })

      Actors.registerSheet("conspiracyx", conspiracyxVehicleSheet, 
      {
          types: ["vehicle"],
          makeDefault: true,
          label: "Default CONX Vehicle Sheet"
      })

      Items.registerSheet("conspiracyx", conspiracyxItemSheet, 
      {
          makeDefault: true,
          label: "Default CONX Item Sheet"
      })


      // Game Settings
      function delayedReload() {window.setTimeout(() => location.reload(), 500)}

      game.settings.register("conspiracyx", "light-mode", {
        name: game.i18n.localize("CONX.Light Mode"),
        hint: game.i18n.localize("CONX.Checking this option enables Light Mode"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: delayedReload
      });


      game.settings.register("conspiracyx", "aegis-ndd", {
          name: game.i18n.localize("CONX.Aegis-NDD"),
          hint: game.i18n.localize("CONX.Checking this option enables NDD wheel instead of Aegis wheel"),
          scope: "world",
          config: true,
          default: false,
          type: Boolean,
          onChange: delayedReload
      });

      const ndd = game.settings.get("conspiracyx", "aegis-ndd");
      document.body.classList.add(ndd ? "conx-ndd" : "conx-aegis");  

})


/* -------------------------------------------- */
/*  Chat Message Hooks                          */
/* -------------------------------------------- */

// Hook for Re-Rolls on Lucky/Unlucky Rolls
Hooks.on("renderChatMessage", (app, html, data) => {
    let chatButton = html[0].querySelector("[data-roll='roll-again']")

    if (chatButton != undefined && chatButton != null) {
        chatButton.addEventListener('click', async () => {
            let ruleTag = ''

            if (html[0].querySelector("[data-roll='dice-result']").textContent == 10) {ruleTag = game.i18n.localize("CONX.Rule of Ten Re-Roll")}
            if (html[0].querySelector("[data-roll='dice-result']").textContent == 1)  {ruleTag = game.i18n.localize("CONX.Rule of One Re-Roll")}

            let priorTotalResult = -1

            if (html[0].querySelector("[data-roll='priorTotalResult']").textContent == 10) {priorTotalResult = 10}
            if (html[0].querySelector("[data-roll='priorTotalResult']").textContent == 1) {priorTotalResult = 1}

            let roll = new Roll('1d10')
            await roll.roll()
            await game?.dice3d?.showForRoll(roll)

            // Grab and Set Values from Previous Roll
            let attributeLabel = html[0].querySelector('h2').outerHTML
            let diceTotal = Number(html[0].querySelector("[data-roll='dice-total']").textContent)
            let rollMod = Number(html[0].querySelector("[data-roll='modifier']").textContent)
            let ruleOfMod = ruleTag === game.i18n.localize("CONX.Rule of Ten Re-Roll") ? Number(roll.result) > 5 ? Number(roll.result) - 5 : 0 : Number(roll.result) > 4 ? 1 : Number(roll.result) - 5
            let ruleOfDiv = ''

            if (roll.result == 10 && priorTotalResult == 10) {
                ruleOfDiv = `<h2 class="rule-of-chat-text">`+game.i18n.localize("CONX.Rule of 10!")+`</h2>
                            <button type="button" data-roll="roll-again" class="rule-of-ten">`+game.i18n.localize(`CONX.Roll Again`)+`</button>`
                ruleOfMod = 5
            } else if (roll.result == 1 && priorTotalResult == 1) {
                ruleOfDiv = `<h2 class="rule-of-chat-text">`+game.i18n.localize("CONX.Rule of 1!")+`</h2>
                            <button type="button" data-roll="roll-again" class="rule-of-one">`+game.i18n.localize(`CONX.Roll Again`)+`</button>`
                ruleOfMod = -5
            } else {
                priorTotalResult = -1 // Rupture Rule of 1/10
            }

            // Create Chat Content
            let tags = [`<div>${ruleTag}</div>`]
            let chatContent = `<form>
                                    ${attributeLabel}

                                    <table class="conspiracyx-chat-roll-table">
                                        <thead>
                                            <tr>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Roll`)+`</th>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Modifier2`)+`</th>
                                                <th class="plus">+</th>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Result2`)+`</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style="visibility: hidden;">
                                                <td data-roll="priorTotalResult">${priorTotalResult}</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td class="w30pc" data-roll="dice-result">[[${roll.result}]]</td>
                                                <td class="w30pc" data-roll="modifier">${rollMod}</td>
                                                <td class="plus">+</td>
                                                <td class="w30pc" data-roll="dice-total">${diceTotal + ruleOfMod}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
                                        ${ruleOfDiv}
                                    </div>
                                </form>`

            ChatMessage.create({
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                user: game.user.id,
                speaker: ChatMessage.getSpeaker(),
                flavor: `<div class="conspiracyx-tags-flex-container">${tags.join('')}</div>`,
                content: chatContent,
                roll: roll
            })
        })
    }
})