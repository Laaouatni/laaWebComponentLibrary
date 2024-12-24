# laaWebComponentLibrary
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



