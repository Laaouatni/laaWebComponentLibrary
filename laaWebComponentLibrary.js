// /* created by Laaouatni - https://github.com/Laaouatni/ */

document.addEventListener("DOMContentLoaded", () => {
  document.body.innerHTML += `
    <template id="laa-for">
      <slot name="childs"></slot>
    </template>
    <template id="laa-for-child">
      <slot></slot>
    </template>`;

  document.querySelectorAll("template").forEach((thisTemplate) => {
    thisTemplate.content.querySelectorAll("script").forEach((thisScript) => {
      thisScript.noModule = true;
    });

    class ThisComponent extends HTMLElement {
      /**
       *
       * @type {{[variableName:string]: any}}
       */
      state = {};

      shadowRoot = this.attachShadow({ mode: "open" });

      previousAttributes = {};

      _connectedCallback() {}
      connectedCallback() {
        this._connectedCallback();

        this.state = new Proxy(this.state, {
          set: (parent, child, val, receiver) => {
            const successfullSet = Reflect.set(parent, child, val, receiver);
            if (!successfullSet) return false;
            updateUIwithNewStateValues(this);
            updateAttributesWithNewStateValues(this);
            return successfullSet;
          },
        });

        copyTemplateToComponentShadowRoot(this);
        copyTemplateAttributesToComponent(this);
        copyTemplateScriptToComponent(this);
      }
      _disconnectedCallback() {}
      disconnectedCallback() {
        this._disconnectedCallback();
      }
    }

    class LaaFor extends ThisComponent {
      connectedCallback() {
        super.connectedCallback();

        const thisArrayName = this.getAttribute("thisArray") || "";
        const thisValueName = this.getAttribute("thisValue") || "thisValue";
        const thisIndexName = this.getAttribute("thisIndex") || "thisIndex";

        const initialLaaForChildNodes = [...this.childNodes];

        renderRepeatedForChildsWithNewArrayValues(this);

        (() => {
          const isReactiveGlobalState = !!eval(thisArrayName.split(".")[0])
            .listenToVariableChange;
          if (!isReactiveGlobalState) return;
          const thisGlobalState = eval(thisArrayName.split(".")[0]);
          const variableToListen = thisArrayName.split(".")[2];

          thisGlobalState.listenToVariableChange(variableToListen, (value) => {
            console.log("changed", value);
            renderRepeatedForChildsWithNewArrayValues(this);
          });
        })();

        /**
         *
         * @param {LaaFor} thisLaaForComponent
         */
        function renderRepeatedForChildsWithNewArrayValues(
          thisLaaForComponent,
        ) {
          const evaluatedArrayValue = eval(thisArrayName);
          const isArray = Array.isArray(evaluatedArrayValue);
          if (!isArray) throw new Error(`"${thisArrayName}" is not an array`);

          thisLaaForComponent.innerHTML = "";

          evaluatedArrayValue.forEach((thisArrayValue, thisIndex) => {
            const thisLaaForChild = document.createElement("laa-for-child");
            thisLaaForChild.setAttribute("slot", "childs");

            initialLaaForChildNodes.forEach((thisChildNode) => {
              const thisChildNodeClone = thisChildNode.cloneNode(true);
              if (!(thisChildNode instanceof HTMLElement)) return;
              thisLaaForChild.appendChild(thisChildNodeClone);
            });

            thisLaaForComponent.appendChild(thisLaaForChild);

            setTimeout(() => {
              thisLaaForChild.state[thisValueName] = thisArrayValue;
              thisLaaForChild.state[thisIndexName] = thisIndex;
              thisLaaForChild.state["thisArray"] = evaluatedArrayValue;
            }, 0);
          });
        }
      }
    }

    class LaaForChild extends ThisComponent {
      connectedCallback() {
        super.connectedCallback();
      }
    }

    customElements.define(
      thisTemplate.id,
      thisTemplate.id == "laa-for"
        ? LaaFor
        : thisTemplate.id == "laa-for-child"
        ? LaaForChild
        : ThisComponent,
    );

    /**
     *
     * @param {ThisComponent} thisComponent
     */
    function copyTemplateToComponentShadowRoot(thisComponent) {
      const templateWithoutScript = thisTemplate.content.cloneNode(true);

      removeScriptNoModule();
      addGridClassToEveryHtmlElementToSolveTailwindBug();

      function removeScriptNoModule() {
        templateWithoutScript.querySelectorAll("script").forEach(
          /**
           *
           * @param {HTMLScriptElement} thisScript
           */
          (thisScript) => {
            thisScript.remove();
          },
        );

        thisComponent.shadowRoot.appendChild(templateWithoutScript);
      }

      function addGridClassToEveryHtmlElementToSolveTailwindBug() {
        thisComponent.childNodes.forEach((thisChildNode) => {
          if (!(thisChildNode instanceof HTMLElement)) return;
          if (thisChildNode instanceof HTMLSlotElement) return;
          if (thisChildNode instanceof HTMLScriptElement) return;
          thisChildNode.setAttribute(
            "class",
            `grid ${thisChildNode.getAttribute("class") || ""}`,
          );
        });
      }
    }

    /**
     *
     * @param {ThisComponent} thisComponent
     */
    function copyTemplateAttributesToComponent(thisComponent) {
      const notWantedAttributes = ["id"];
      const notMergableAttributes = [];

      [...thisTemplate.attributes].forEach((thisTemplateAttribute) => {
        if (!thisTemplateAttribute.nodeValue) return;

        const canIgnoreAttribute = notWantedAttributes.some(
          (thisUnwantedAttribute) => {
            return thisTemplateAttribute.nodeName == thisUnwantedAttribute;
          },
        );

        if (canIgnoreAttribute) return;

        const hasAlreadyAttribute = !!thisComponent.getAttribute(
          thisTemplateAttribute.nodeName,
        );

        if (hasAlreadyAttribute) {
          const canMergeAttribute = !notMergableAttributes.some(
            (thisNotMergableAttribute) => {
              return thisTemplateAttribute.nodeName == thisNotMergableAttribute;
            },
          );

          if (canMergeAttribute) {
            thisComponent.setAttribute(
              thisTemplateAttribute.nodeName,
              `${thisComponent.getAttribute(thisTemplateAttribute.nodeName)} ${
                thisTemplateAttribute.nodeValue
              }`,
            );

            return;
          }
        }

        thisComponent.setAttribute(
          thisTemplateAttribute.nodeName,
          thisTemplateAttribute.nodeValue,
        );
      });
    }

    /**
     *
     * @param {ThisComponent} thisComponent
     */
    function copyTemplateScriptToComponent(thisComponent) {
      const templateScripts = thisTemplate.content.querySelectorAll("script");
      if (templateScripts.length == 0) return;

      const generatedScript = document.createElement("script");

      templateScripts.forEach((thisTemplateScript) => {
        if (thisTemplateScript.textContent == "") return;
        generatedScript.textContent += thisTemplateScript.textContent;
      });

      thisComponent.appendChild(generatedScript);
    }

    /**
     *
     * @param {ThisComponent} thisComponent
     */
    function updateUIwithNewStateValues(thisComponent) {
      const allVariableElementToChange = [
        ...thisComponent.querySelectorAll("[data-var]"),
        ...thisComponent.shadowRoot.querySelectorAll("[data-var]"),
      ];

      allVariableElementToChange.forEach((thisVariableElement) => {
        const variableName = thisVariableElement.getAttribute("data-var");
        if (!variableName) return;

        const evaluatedValue = eval(variableName);
        const isFunctionVariable = typeof evaluatedValue == "function";

        const valueToReturn = isFunctionVariable
          ? evaluatedValue()
          : evaluatedValue;

        if (valueToReturn == undefined) return;

        thisVariableElement.textContent = isFunctionVariable
          ? evaluatedValue()
          : evaluatedValue;
      });
    }

    /**
     *
     * @param {ThisComponent} thisComponent
     */
    function updateAttributesWithNewStateValues(thisComponent) {
      [...thisComponent.attributes].forEach((thisComponentAttribute) => {
        if (!thisComponentAttribute.nodeValue) return;

        const hasAtLeastOneVariable =
          !!thisComponentAttribute.nodeValue.match(/\{[^\}]*\}/g);

        if (
          !hasAtLeastOneVariable &&
          thisComponent.previousAttributes[thisComponentAttribute.nodeName]
        ) {
          thisComponent.setAttribute(
            thisComponentAttribute.nodeName,
            thisComponent.previousAttributes[thisComponentAttribute.nodeName],
          );
        }

        const newEvaluatedValue = thisComponent
          .getAttribute(thisComponentAttribute.nodeName)
          ?.replaceAll(
            /\{[^\}]*\}/g,
            (thisVariableAttributeExpressionWithBrackets) => {
              const thisVariableExpression =
                thisVariableAttributeExpressionWithBrackets.replaceAll(
                  /\{|\}/g,
                  "",
                );
              return eval(thisVariableExpression);
            },
          );

        thisComponent.previousAttributes[thisComponentAttribute.nodeName] =
          thisComponentAttribute.nodeValue;

        thisComponent.setAttribute(
          thisComponentAttribute.nodeName,
          newEvaluatedValue || "",
        );
      });
    }
  });
});

class laaState {
  constructor(initialStateObject = {}) {
    /**
     *
     * @type {{[variableName:string]: ((thisNewValue:any) => void)[]}}
     */
    this.userListeners = {};

    /**
     *
     * @type {{[variableName:string]: any}}
     */
    this.state = new Proxy(initialStateObject, {
      set: (parent, property, thisNewValue, receiver) => {
        const thisPreviousValue = parent[property];
        const successfullSet = Reflect.set(
          parent,
          property,
          thisNewValue,
          receiver,
        );
        if (!successfullSet) return false;

        (() => {
          if (thisPreviousValue === thisNewValue) return;
          this.userListeners[property]?.forEach(
            /**
             *
             * @param {(thisNewValue:any) => void} callback
             */
            (callback) => {
              callback(thisNewValue);
            },
          );
        })();

        return successfullSet;
      },
    });
  }

  listenToVariableChange(variableToListen, callback) {
    if (!this.userListeners[variableToListen]) {
      this.userListeners[variableToListen] = [];
    }

    this.userListeners[variableToListen].push(callback);
  }
}
