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

  customElements.define(thisTemplate.id, ThisComponent);

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function copyTemplateToComponentShadowRoot(thisComponent) {
    const templateWithoutScript = thisTemplate.content.cloneNode(true);

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
    Object.entries(thisComponent.state).forEach(([key, value]) => {
      const variableHtmlElementsToChange =
        thisComponent.shadowRoot.querySelectorAll(`[data-var=${key}]`);
      if (variableHtmlElementsToChange.length == 0) return;

      variableHtmlElementsToChange.forEach((thisVariableElement) => {
        thisVariableElement.textContent = value;
      });
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
      
      if (!hasAtLeastOneVariable && thisComponent.previousAttributes[thisComponentAttribute.nodeName]) {
        thisComponent.setAttribute(
          thisComponentAttribute.nodeName,
          thisComponent.previousAttributes[thisComponentAttribute.nodeName]
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

      thisComponent.previousAttributes[thisComponentAttribute.nodeName] = thisComponentAttribute.nodeValue;

      thisComponent.setAttribute(
        thisComponentAttribute.nodeName,
        newEvaluatedValue || "",
      );
    });
  }
});

/**
 * @typedef {{parent: HTMLElement, childs?: (ChildNode | HTMLElement | TypeHtmlElementStructure)[] }} TypeHtmlElementStructure
 */

/**
 *
 * @param {HTMLElement} paramHtmlElement
 * @returns {TypeHtmlElementStructure}
 */
function getHtmlElementArrayStructure(paramHtmlElement) {
  return recursiveRemoveUnwantedItems(paramHtmlElement);

  /**
   *
   * @param {HTMLElement} paramHtmlElement
   * @returns {TypeHtmlElementStructure}
   */
  function recursiveRemoveUnwantedItems(paramHtmlElement) {
    const parentElementWithUnwantedItems =
      removeUnwantedItems(paramHtmlElement);
    if (parentElementWithUnwantedItems.length == 0)
      return { parent: paramHtmlElement };

    return {
      parent: paramHtmlElement,
      childs: parentElementWithUnwantedItems.map((thisElement) => {
        if (thisElement.childNodes.length == 0) return thisElement;
        return recursiveRemoveUnwantedItems(thisElement);
      }),
    };
  }

  /**
   *
   * @param {HTMLElement} paramHtmlElement
   * @returns {ChildNode[]}
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

      return !isUnwantedItem;
    });
  }
}
