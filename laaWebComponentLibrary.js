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

      const isForLoop = this.nodeName === "laa-for".toUpperCase();
      if (isForLoop) forLoopComponentLogic(this);

      const copyFromTemplateToComponent = {
        templateContent: copyTemplateContentToComponentShadowDom,
        attributes: copyAttributesFromTemplateToComponent,
        scripts: copyScriptsFromTemplateToComponent,
      };

      copyFromTemplateToComponent.templateContent(this);
      copyFromTemplateToComponent.attributes(this, ["class", "style"]);
      this.initialClassList = [...this.classList];

      this.stateVariables = new Proxy(this.stateVariables, {
        set: (parent, child, val) => {
          parent[child] = val;
          updateComponentInnerHtmlVariables(this);
          updateClassAttribute(this);
          return true;
        },
      });

      copyFromTemplateToComponent.scripts(this);
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
  function forLoopComponentLogic(thisComponent) {
    const slotContent = minifyHtmlString(thisComponent.innerHTML);
    const slotContentWithoutScripts = minifyHtmlString(
      thisComponent.innerHTML,
    ).replaceAll(/<script>.*<\/script>/g, "");
    const forAttributes = {
      arrayItems: thisComponent.getAttribute("arrayItems"),
      thisItem: thisComponent.getAttribute("thisItem") || "thisItem",
    };

    if (!forAttributes.arrayItems) {
      const errorStringMessage = `Attribute "arrayItems" is required for "laa-for" tag`;
      throw new Error(errorStringMessage);
    }

    const arrayItemsValues = eval(forAttributes.arrayItems ?? "[]");

    setTimeout(() => {
      arrayItemsValues.forEach((thisItemValue) => {
        thisComponent.childNodes.forEach((thisChild) => {
          const isChildComponent = thisChild.nodeName.includes("-");
  
          if (isChildComponent) {
            thisChild.stateVariables[forAttributes.thisItem] = thisItemValue;
          }
          // console.log(thisItemValue, thisChild)
        });
      });
    }, 0)

    // thisComponent.innerHTML = "";
    // arrayItemsValues.forEach((thisItemValue) => {
    //   let slotStringToAdd = slotContentWithoutScripts;
    //   slotStringToAdd = slotStringToAdd.replaceAll(
    //     new RegExp(`{${forAttributes.thisItem}}`, "g"),
    //     thisItemValue,
    //   );
    //   thisComponent.innerHTML += slotStringToAdd;
    //   console.log(slotStringToAdd, thisItemValue);
    // });
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function updateClassAttribute(thisComponent) {
    let updateClassListString = "";

    thisComponent.initialClassList.forEach(
      /**
       *
       * @param {typeof thisComponent.initialClassList[number]} thisClass
       * @returns
       */
      (thisClass) => {
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
          const evaluatedClassCondition = eval(thisClassData.condition);
          if (evaluatedClassCondition) {
            updateClassListString += `${thisClassData.trueClass} `;
          }
        } catch (e) {
          /*skip*/
        }
      },
    );

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
      result = result.replaceAll(
        regexVariable,
        `${STATE_OBJECT_POSITION_PREFIX_STRING}${thisVariableName}`,
      );
    });
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
        const variableValue = thisComponent.stateVariables[variableName];
        const isFunctionVariable = typeof variableValue == "function";
        const variableValueToReturn = isFunctionVariable
          ? variableValue()
          : variableValue;
        return variableValueToReturn;
      },
    );
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function copyTemplateContentToComponentShadowDom(thisComponent) {
    thisComponent.shadowDom = thisComponent.attachShadow({ mode: "open" });
    const clonedTemplateContent = thisTemplateElement.content.cloneNode(true);

    clonedTemplateContent.childNodes.forEach((thisChild) => {
      if (thisChild instanceof HTMLScriptElement) thisChild.remove();
    });

    thisComponent.shadowDom.appendChild(clonedTemplateContent);
  }

  /**
   * @param {ThisComponent} thisComponent
   * @param {string[]} attributesToCopyArray
   */
  function copyAttributesFromTemplateToComponent(
    thisComponent,
    attributesToCopyArray,
  ) {
    attributesToCopyArray.forEach((thisAttributeName) => {
      if (!thisTemplateElement.hasAttribute(thisAttributeName)) return;

      thisComponent.setAttribute(
        thisAttributeName,
        `${
          thisComponent.getAttribute(thisAttributeName) || ""
        } ${thisTemplateElement.getAttribute(thisAttributeName)}`.trim(),
      );
    });
  }

  /**
   *
   * @param {ThisComponent} thisComponent
   */
  function copyScriptsFromTemplateToComponent(thisComponent) {
    const allScriptElementsInside = {
      template: thisTemplateElement.content.querySelectorAll("script"),
      component: thisComponent.querySelectorAll("script"),
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

    thisComponent.appendChild(generatedScriptElementInsideComponent);
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
