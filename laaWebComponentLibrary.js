// /* created by Laaouatni - https://github.com/Laaouatni/ */

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

    /**
     *
     * @type {DocumentFragment | Node}
     */
    templateWithoutScript;

    _connectedCallback() {}
    connectedCallback() {
      this._connectedCallback();

      this.state = new Proxy(this.state, {
        set: (parent, child, val, receiver) => {
          updateUIwithNewStateValues(this);
          console.log(getHtmlElementArrayStructure(this))
          return Reflect.set(parent, child, val, receiver);
        },
      });

      copyTemplateToComponentShadowRoot(this);
      copyTemplateScriptToComponent(this);
    }
    _disconnectedCallback() {}
    disconnectedCallback() {
      this._disconnectedCallback();
    }
  }

  customElements.define(thisTemplate.id, ThisComponent);

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function copyTemplateScriptToComponent(thisComponent) {
    const elements = {
      templateScripts: thisTemplate.content.querySelectorAll("script"),
      component: thisComponent,
      newScript: document.createElement("script"),
    };

    elements.templateScripts.forEach((thisTemplateScript) => {
      elements.newScript.textContent += thisTemplateScript.textContent;
    });

    elements.component.appendChild(elements.newScript);
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function copyTemplateToComponentShadowRoot(thisComponent) {
    thisComponent.templateWithoutScript = thisTemplate.content.cloneNode(true);
    thisComponent.templateWithoutScript.querySelectorAll("script").forEach(
      /**
       *
       * @param {HTMLScriptElement} thisScript
       */
      (thisScript) => {
        thisScript.remove();
      },
    );
    thisComponent.shadowRoot.appendChild(thisComponent.templateWithoutScript);
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function updateUIwithNewStateValues(thisComponent) {
    // console.log(thisComponent, getHtmlElementArrayStructure(thisComponent));
    // console.log(thisComponent.templateWithoutScript);
  }

  // thisTemplate.remove();
});

// const bodyStructure = getHtmlElementArrayStructure(document.body);
// console.log(bodyStructure);

/**
 *
 * @param {HTMLElement} paramHtmlElement
 * @returns
 */
function getHtmlElementArrayStructure(paramHtmlElement) {
  return recursiveRemoveUnwantedItems(paramHtmlElement);

  /**
   *
   * @param {HTMLElement} paramHtmlElement
   * @returns
   */
  function recursiveRemoveUnwantedItems(paramHtmlElement) {
    return removeUnwantedItems(paramHtmlElement).map((thisElement) => {
      if (thisElement.childNodes.length == 0) return thisElement;
      return recursiveRemoveUnwantedItems(thisElement);
    });
  }

  /**
   *
   * @param {HTMLElement} paramHtmlElement
   * @returns
   */
  function removeUnwantedItems(paramHtmlElement) {
    return [...paramHtmlElement.childNodes].filter((thisChildNode) => {
      const conditions = {
        text: {
          isText: thisChildNode instanceof Text,
          isEmpty:
            (thisChildNode.textContent || "")
              .replaceAll("\n", "")
              .replaceAll(" ", "") == "",
        },
        isComment: thisChildNode instanceof Comment,
        isScript: thisChildNode instanceof HTMLScriptElement,
        isTemplate: thisChildNode instanceof HTMLTemplateElement,
      };

      const isUnwantedItem =
        (conditions.text.isText && conditions.text.isEmpty) ||
        conditions.isComment ||
        conditions.isScript ||
        conditions.isTemplate;

      if (!isUnwantedItem) return thisChildNode;
    });
  }
}
