/* created by Laaouatni - https://github.com/Laaouatni/ */
document.querySelectorAll("template").forEach((thisTemplateElement) => {
  const STATE_OBJECT_POSITION_PREFIX_STRING = "thisComponent.stateVariables.";
  class ThisComponent extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    shadowDom;

    /**
     *
     * @type {{[variableName:string]: any}}
     */
    stateVariables = {};

    /**
     *
     * @type {DOMTokenList | string[]} initialClassList
     */
    initialClassList;
    constructor() {
      super();
    }

    static get observedAttributes() {
      const attributesToObserve = [...thisTemplateElement.attributes]
        .map((thisAttribute) => thisAttribute.nodeName)
        .filter((thisAttribute) => {
          let canSkip = false;
          ["id", "class", "style"].forEach((thisAttributeName) => {
            if (thisAttribute == thisAttributeName) canSkip = true;
          });
          return !canSkip;
        });
      return attributesToObserve;
    }

    _connectedCallback() {}
    connectedCallback() {
      this._connectedCallback();

      const copyFromTemplateToComponent = {
        templateContent: copyTemplateContentToComponentShadowDom.bind(this),
        attributes: copyAttributesFromTemplateToComponent.bind(this),
        scripts: copyScriptsFromTemplateToComponent.bind(this),
      };

      copyFromTemplateToComponent.templateContent();
      copyFromTemplateToComponent.attributes(["class", "style"]);
      this.initialClassList = [...this.classList];
      console.log("CONNECTED", this.initialClassList);
      this.stateVariables = new Proxy(this.stateVariables, {
        set: (parent, child, val) => {
          parent[child] = val;
          updateComponentInnerHtmlVariables(this);
          updateClassAttribute(this);
          return true;
        },
      });

      copyFromTemplateToComponent.scripts();
    }

    _disconnectedCallback() {}
    disconnectedCallback() {
      this._disconnectedCallback();
    }

    /**
     * @param {string} attributeName
     * @param {any} oldValue
     * @param {any} newValue
     */
    _attributeChangedCallback(attributeName, oldValue, newValue) {}
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

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function updateClassAttribute(thisComponent) {
    let updateClassListString = "";

    thisComponent.initialClassList.forEach((thisClass) => {
      const isDynamicClass =
        thisClass.startsWith("{") && thisClass.endsWith("}");
      if (!isDynamicClass) {
        updateClassListString += `${thisClass} `;
        return;
      }
      const splittedClass = thisClass.split(/\?|:/g);
      const thisClassData = {
        condition: addSyntacticSugarClassConditions(
          splittedClass[0],
          thisComponent,
        ),
        trueClass: splittedClass[1].replaceAll("'", ""),
        falseClass: splittedClass[2].replaceAll("'", ""),
      };

      try {
        if (eval(thisClassData.condition)) {
          updateClassListString += `${thisClassData.trueClass} `;
        }
      } catch (e) {/*skip*/ };
    });

    thisComponent.setAttribute("class", updateClassListString.trim());
  }

  /**
   *
   * @param {string} conditionString
   * @param {ThisComponent} thisComponent
   * @returns {string}
   */
  function addSyntacticSugarClassConditions(conditionString, thisComponent) {
    let result = conditionString.replace("{", "");
    Object.keys(thisComponent.stateVariables).forEach((thisVariableName) => {
      const regexVariable = new RegExp(
        `(?<!\\w)(${thisVariableName})(?!\\w)`,
        "g",
      );
      result = result.replaceAll(regexVariable, `${STATE_OBJECT_POSITION_PREFIX_STRING}${thisVariableName}`);
    });
    console.log(result);
    return result;
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function updateComponentInnerHtmlVariables(thisComponent) {
    thisComponent.shadowDom.innerHTML =
      replaceHtmlStringVariablesBracketsWithValues(thisComponent);
  }

  /**
   *
   * @param {string} htmlStringToMinify
   * @returns {string}
   */
  function minifyHtmlString(htmlStringToMinify) {
    return htmlStringToMinify.replaceAll("\n", "").replaceAll("  ", "");
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   * @returns {string}
   */
  function replaceSlotTagWithSlotContent(thisComponent) {
    const minifiedHtmlStrings = {
      shadowDom: minifyHtmlString(thisTemplateElement.innerHTML),
      slot: minifyHtmlString(thisComponent.innerHTML),
    };
    const regexScriptTag = /<script>.*<\/script>/g;
    const slotHtmlStringWithoutScripts = minifiedHtmlStrings.slot.replace(
      regexScriptTag,
      "",
    );
    return minifiedHtmlStrings.shadowDom.replaceAll(
      "<slot></slot>",
      slotHtmlStringWithoutScripts,
    );
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   * @returns {string}
   */
  function replaceHtmlStringVariablesBracketsWithValues(thisComponent) {
    const thisComponentHtmlWithSlotTagReplacedWithSlotContent =
      replaceSlotTagWithSlotContent(thisComponent);
    const regexGetAllVariableBracketsInString = /\{.[^}]*\}/g;

    return thisComponentHtmlWithSlotTagReplacedWithSlotContent.replace(
      regexGetAllVariableBracketsInString,
      (thisVariableBracketStringPart) => {
        const variableName = thisVariableBracketStringPart.replace(
          /\{|\}/g,
          "",
        );
        return thisComponent.stateVariables[variableName];
      },
    );
  }

  function copyTemplateContentToComponentShadowDom() {
    this.shadowDom = this.attachShadow({ mode: "open" });
    const clonedTemplateContent = thisTemplateElement.content.cloneNode(true);

    clonedTemplateContent.childNodes.forEach((thisChild) => {
      if (thisChild instanceof HTMLScriptElement) thisChild.remove();
    });

    this.shadowDom.appendChild(clonedTemplateContent);
  }

  /**
   *
   * @param {string[]} attributesToCopyArray
   */
  function copyAttributesFromTemplateToComponent(attributesToCopyArray) {
    attributesToCopyArray.forEach((thisAttributeName) => {
      if (!thisTemplateElement.hasAttribute(thisAttributeName)) return;

      this.setAttribute(
        thisAttributeName,
        `${
          this.getAttribute(thisAttributeName) || ""
        } ${thisTemplateElement.getAttribute(thisAttributeName)}`.trim(),
      );
    });
  }

  function copyScriptsFromTemplateToComponent() {
    const allScriptElementsInside = {
      template: thisTemplateElement.content.querySelectorAll("script"),
      component: this.querySelectorAll("script"),
    };

    const generatedScriptElementInsideComponent =
      document.createElement("script");

    const mergedScriptTags = [
      ...allScriptElementsInside.template,
      ...allScriptElementsInside.component,
    ]
      .map((thisScriptTemplateElement) => {
        if (!thisScriptTemplateElement.textContent) return "";
        return thisScriptTemplateElement.textContent;
      })
      .join("");

    const syntacticSugarVariablesAddedToScriptString =
      addSyntacticSugarVariableDeclarationsToScriptTextContent(
        mergedScriptTags,
      );

    generatedScriptElementInsideComponent.textContent =
      isolateScriptStringInsideComponent(
        syntacticSugarVariablesAddedToScriptString,
      ).replaceAll("  ", "");

    this.appendChild(generatedScriptElementInsideComponent);
  }

  /**
   * @param {string} scriptTextContentString
   * @returns {string}
   */
  function addSyntacticSugarVariableDeclarationsToScriptTextContent(
    scriptTextContentString,
  ) {
    const allVariableDefinitionInfo = [
      ...scriptTextContentString.matchAll(/(let|const)(.[^=]*)=/g),
    ].map((thisMatch) => {
      return {
        variableDefinitionType: thisMatch[1],
        variableName: thisMatch[2].trim(),
      };
    });

    const allVariableDefinitionInfoWithPositionReplaced =
      allVariableDefinitionInfo
        .reduce((prev, curr, index) => {
          const regexVariablePositions = new RegExp(
            `(?<!\\w)(${curr.variableName})(?!\\w)`,
            "g",
          );

          return prev.replaceAll(
            regexVariablePositions,
            `${STATE_OBJECT_POSITION_PREFIX_STRING}${curr.variableName}`,
          );
        }, scriptTextContentString)
        .replaceAll(/let|const/g, "");

    return allVariableDefinitionInfoWithPositionReplaced;
  }
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
});
