// /* created by Laaouatni - https://github.com/Laaouatni/ */

document.querySelectorAll("template").forEach((thisTemplate) => {
  thisTemplate.content.querySelectorAll("script").forEach((thisScript) => {
    thisScript.noModule = true;
  })

  class ThisComponent extends HTMLElement {
    /**
     *
     * @type {{[variableName:string]: any}}
     */
    state = {};
    shadowRoot = this.attachShadow({ mode: "open" });
    _connectedCallback() {}
    connectedCallback() {
      this._connectedCallback();
      copyTemplateToComponent(this);
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
  function copyTemplateToComponent(thisComponent) {
    const elements = {
      template: thisTemplate.content.cloneNode(true),
      component: thisComponent.shadowRoot,
    };
    elements.component.appendChild(elements.template);
  }
});

const bodyStructure = getHtmlElementArrayStructure(document.body);
console.log(bodyStructure)

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
