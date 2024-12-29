# laaWebComponentLibrary

# ⚠️ rewriting this in progress here https://github.com/Laaouatni/arduino-2024-2025-prove/tree/main/2025/svelteRecreation

simple, easy, efficient way to create web components like a framework without bundlers/npm/node complexity

### Create and use a basic html component

```html
<my-component></my-component>

<template id="my-component">
  hello world
</template>

<script src="./laaWebComponentLibrary.js"></script>
```

- the `<template>` tag is where you insert the code of your component
- this library to work properly need that you add for each new template/component a unique `id`
  - the `id` need to have at least one slash (`-`), for example:
    - ❌ `mycomponent`
    - ✅ `my-component`
- the script tag of this library need to be inserted
  - at the end of the html
    ```html
    <body>
      <!-- your other code -->
      <script src="./laaWebComponentLibrary.js"></script>
    </body>
    ```
  - OR in the `<head>` with a `defer` attribute
    ```html
    <head>
      <script defer src="./laaWebComponentLibrary.js"></script>
    </head>
    <body>
      <!-- your other code -->
    </body>
    ```

---

### How to use `<slot>`

```html
<my-component>
  world
</my-component>

<template id="my-component">
  hello <slot></slot>!!
</template>
```

---

### How to create more components

```html
<my-component>world</my-component>
<other-component></other-component>

<template id="my-component">
  hello <slot></slot>!!
</template>

<template id="other-component">
  <h1>hello world</h1>
</template>
```

---

### How to create a component inside another component

```html
<other-component>
  <my-component>world</my-component>
</other-component>

<template id="my-component">
  hello <slot></slot>!!
</template>

<template id="other-component">
  <h1>hello world</h1>
  <slot></slot>
</template>
```

---

### How to create scoped component variables that change onClick

```html
<my-component></my-component>
<my-component></my-component>
<my-component></my-component>

<template id="my-component">
  click me

  <script nomodule>
    let i=0;
    thisComponent.addEventListener('click', () => {
      i++;
      console.log(i);
    });
  </script>
</template>
```

- in this library, the `script` tag that have the `nomodule` attribute are treaded a local scoped js containers of logic. Insert there the specific logic that is only access individually by each component
- the `i` variable in this case is unique to each created component, so it not readed or accessed by any external scripts or any other component
  > we are using the `IIFE` Approach to make this a reality https://developer.mozilla.org/en-US/docs/Glossary/IIFE
- this library has created a default variable `thisComponent` that you can use to access directly the component html instance
  - use `thisComponent` to do all dom operations you want (more details on MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
  - you can even change the behaviour of the web component low-level implementation by using `thisComponent.constructor.prototype` object
 
---

### How to create global shared variables inside the component

```html
<my-component></my-component>
<my-component></my-component>
<my-component></my-component>

<template id="my-component">
  click me

  <script>
    let mySharedVariable = 0;
  </script>

  <script nomodule>
    thisComponent.addEventListener('click', () => {
      mySharedVariable++;
      console.log(mySharedVariable);
    });
  </script>
</template>
```

- in this library, the `script` tag that have the `nomodule` attribute are treaded a local scoped js containers of logic. Insert there the specific logic that is only access individually by each component
- in this library, the `script` tag that DON'T contains the `nomodule` attribute are treated like normal js code
   - basically, you can create global variables or shared variables between components, but the catch is that:
      - the variable names need to be unique among all the js code
      - you CAN'T access the `thisComponent` or dom apis specific to this component even if the code is nested inside template

---

### Run some logic when component is going to be removed from the DOM

```html
<my-component></my-component>

<template id="my-component">
  hello world
  <script nomodule>
    thisComponent.constructor.prototype._disconnectedCallback = () => {
      console.log('the component is disconnected/removed from the DOM');
    };
  </script>
</template>
```

---

### Listen Reactively to any attribute changes

```html
<my-component></my-component>

<template id="my-component" checked="false">
  hello world
  <script nomodule>
    thisComponent.addEventListener('click', () => {
      const isChecked = thisComponent.getAttribute('checked') == 'true';
      thisComponent.setAttribute('checked', !isChecked);
    });

    thisComponent.constructor.prototype._attributeChangedCallback = (attributeName, oldValue, newValue) => {
      console.log('attributeChangedCallback', attributeName, oldValue, newValue);
    };
  </script>
</template>
```
- to listen to certain attribute, you need to set default values in `<template>` like this:
  ```html
  <template
    checked="false"
    foo="bar"
    hello="world"
    id="my-component"
  />
  ```
  otherwise it will ignore them even if they will be added/modified when the program runs.
- override the `thisComponent.constructor.prototype._attributeChangedCallback` with a function that takes 3 parameters:
  - the first parameter is the attribute name which is useful to create some checking logic like this:
    ```js
    if(attributeName == "checked") {}
    if(attributeName == "foo") {}
    if(attributeName == "hello") {}
    ```
  - the second parameter is the previous value because this change
  - the third parameter is the new value of the attribute
- in the example I simulated a click event so you can't see what happening in the dev console
  
