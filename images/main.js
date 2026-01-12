// Import Modules
import { conspiracyxmmfoActorSheet } from "./actor-sheet.js";
import { conspiracyxmmfoActor } from "./actor.js";
import { conspiracyxmmfoItem } from "./item.js";
import { conspiracyxmmfoItemSheet } from "./item-sheet.js";
import { conspiracyxmmfoCellSheet } from "./cell-sheet.js"
import { conspiracyxmmfoCreatureSheet } from "./creature-sheet.js"
import { conspiracyxmmfoVehicleSheet } from "./vehicle-sheet.js"
import { registerHandlebarsHelpers } from "./helpers.js";

import { conspiracyxmmfoMessage } from "./chat-message.js";



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
      CONFIG.Actor.documentClass = conspiracyxmmfoActor
      CONFIG.Item.documentClass = conspiracyxmmfoItem

      CONFIG.ChatMessage.documentClass = conspiracyxmmfoMessage;

      // Register sheet application classes
      Actors.unregisterSheet("core", ActorSheet)

      Actors.registerSheet("conspiracyxmmfo", conspiracyxmmfoActorSheet, 
      {
          types: ["character"],
          makeDefault: true,
          label: "Default CONX Character Sheet"
      })

      Actors.registerSheet("conspiracyxmmfo", conspiracyxmmfoCreatureSheet, 
      {
          types: ["creature"],
          makeDefault: true,
          label: "Default CONX Creature Sheet"
      })

      Actors.registerSheet("conspiracyxmmfo", conspiracyxmmfoCellSheet, 
      {
          types: ["cell"],
          makeDefault: true,
          label: "Default CONX Cell Sheet"
      })

      Actors.registerSheet("conspiracyxmmfo", conspiracyxmmfoVehicleSheet, 
      {
          types: ["vehicle"],
          makeDefault: true,
          label: "Default CONX Vehicle Sheet"
      })

      Items.registerSheet("conspiracyxmmfo", conspiracyxmmfoItemSheet, 
      {
          makeDefault: true,
          label: "Default CONX Item Sheet"
      })


      // Game Settings
      function delayedReload() {window.setTimeout(() => location.reload(), 500)}
      /*
      game.settings.register("conspiracyxmmfo", "light-mode", {
        name: game.i18n.localize("CONX.Light Mode"),
        hint: game.i18n.localize("CONX.Checking this option enables Light Mode"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: delayedReload
      });
      */

      game.settings.register("conspiracyxmmfo", "aegis-ndd", {
          name: game.i18n.localize("CONX.Aegis-NDD"),
          hint: game.i18n.localize("CONX.Checking this option enables NDD wheel instead of Aegis wheel"),
          scope: "world",
          config: true,
          default: false,
          type: Boolean,
          onChange: delayedReload
      });

      const ndd = game.settings.get("conspiracyxmmfo", "aegis-ndd");
      document.body.classList.add(ndd ? "conx-ndd" : "conx-aegis");  

})


/**
 * Adds custom dice to Dice So Nice!.
 */
Hooks.once("diceSoNiceReady", (dice3d) => {
  // Called once the module is ready to listen to new rolls and display 3D animations.
  // dice3d: Main class, instantiated and ready to use.

  /**
   * Add a colorset (theme)
   * @param {Object} colorset (see below)
   * @param {string} mode= "default","preferred"
   * The "mode" parameter have 2 modes :
   * - "default" only register the colorset
   * - "preferred" apply the colorset if the player didn't already change his dice appearance for this world.
   */
  dice3d.addColorset(
    {
      name: "conx",
      description: "ConX",
      foreground: "#ffffff",
      background: "#000000",
      edge: "#000000",
      font: "Industria",
    },
    "preferred",
  )

  dice3d.addSystem({ id: "conspiracyx", name: "Conspiracy X" }, "preferred");
  dice3d.addDicePreset({
    type: "d10",
    labels: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "systems/conspiracyxmmfo/images/avatars/DiceDavidDukeOVNI.png",
    ],

    system: "conspiracyx",
  });


});



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

            let roll = new Roll('1d10')
            await roll.roll()
            await game?.dice3d?.showForRoll(roll)

            // Grab and Set Values from Previous Roll
            let attributeLabel = html[0].querySelector('h2').outerHTML
            let diceTotal = Number(html[0].querySelector("[data-roll='dice-total']").textContent)
            let rollMod = Number(html[0].querySelector("[data-roll='modifier']").textContent)
            let ruleOfMod = ruleTag === game.i18n.localize("CONX.Rule of Ten Re-Roll") ? Number(roll.result) > 5 ? Number(roll.result) - 5 : 0 : Number(roll.result) > 4 ? 0 : Number(roll.result) - 5
            if (ruleTag === game.i18n.localize("CONX.Rule of One Re-Roll") && diceTotal == 1 && ruleOfMod < 0) {ruleOfMod--}
            let ruleOfDiv = ''

            if (roll.result == 10 && ruleTag === game.i18n.localize("CONX.Rule of Ten Re-Roll")) {
                ruleOfDiv = `<h2 class="rule-of-chat-text">`+game.i18n.localize("CONX.Rule of 10!")+`</h2>
                            <button type="button" data-roll="roll-again" class="rule-of-ten">`+game.i18n.localize(`CONX.Roll Again`)+`</button>`
                ruleOfMod = 5
            }
            
            if (roll.result == 1 && ruleTag === game.i18n.localize("CONX.Rule of One Re-Roll")) {
                ruleOfDiv = `<h2 class="rule-of-chat-text">`+game.i18n.localize("CONX.Rule of 1!")+`</h2>
                            <button type="button" data-roll="roll-again" class="rule-of-one">`+game.i18n.localize(`CONX.Roll Again`)+`</button>`
                ruleOfMod = -5
                if (diceTotal == 1) {ruleOfMod--}
            }

            // Create Chat Content
            let tags = [`<div>${ruleTag}</div>`]
            let chatContent = `<form>
                                    ${attributeLabel}

                                    <table class="conspiracyxmmfo-chat-roll-table">
                                        <thead>
                                            <tr>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Roll`)+`</th>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Modifier2`)+`</th>
                                                <th class="plus">+</th>
                                                <th class="w30pc">`+game.i18n.localize(`CONX.Result2`)+`</th>
                                            </tr>
                                        </thead>
                                        <tbody>
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
                flavor: `<div class="conspiracyxmmfo-tags-flex-container">${tags.join('')}</div>`,
                content: chatContent,
                roll: roll
            })
        })
    }
})