/// <reference types="@sveltejs/kit" />

declare namespace svelte.JSX {
  interface DOMAttributes<T> {
    onoutclick?: CompositionEventHandler<T>;
  }
}