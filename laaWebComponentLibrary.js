/* created by Laaouatni - https://github.com/Laaouatni/ */

document.querySelectorAll("template").forEach((thisTemplateElement) => {
  class ThisComponent extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    shadow;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.shadow.appendChild(thisTemplateElement.content.cloneNode(true));

      const hasScriptTagInTemplateComponent =
        thisTemplateElement.content.querySelectorAll("script[nomodule]");

      hasScriptTagInTemplateComponent.forEach((thisTemplateComponentScriptNoModule) => {
        const generatedShadowScript = document.createElement("script");
        generatedShadowScript.textContent = isolateScriptStringInsideComponent(
          thisTemplateComponentScriptNoModule.textContent || "",
        );
        this.shadow.host.appendChild(generatedShadowScript);
        this.shadow.querySelectorAll("script[nomodule]").forEach((thisComponentScriptNoModule) => {
          thisComponentScriptNoModule.remove();
        });
      });
    }

    static get observedAttributes() {
      const attributesToObserve = [...thisTemplateElement.attributes]
        .map((thisAttribute) => thisAttribute.nodeName)
        .filter((thisAttribute) => {
          const isIdAttribute = thisAttribute === "id";
          if (isIdAttribute) return;
          return true;
        });
      return attributesToObserve;
    }

    _connectedCallback() {}
    _disconnectedCallback() {}
    /**
     * @param {string} attributeName
     * @param {any} oldValue
     * @param {any} newValue
     */
    _attributeChangedCallback(attributeName, oldValue, newValue) {}

    connectedCallback() {
      this._connectedCallback();
    }

    disconnectedCallback() {
      this._disconnectedCallback();
    }
    /**
     * @param {string} attributeName
     * @param {any} oldValue
     * @param {any} newValue
     */
    attributeChangedCallback(attributeName, oldValue, newValue) {
      this._attributeChangedCallback(attributeName, oldValue, newValue);
    }
  }
  customElements.define(thisTemplateElement.id, ThisComponent);
});

/**
 * @param   {string} thisScriptString
 * @returns {string}
 */
function isolateScriptStringInsideComponent(thisScriptString) {
  return `(()=>{
    const thisComponent = document.currentScript.parentElement;
    ${thisScriptString}}
  )()`;
}
