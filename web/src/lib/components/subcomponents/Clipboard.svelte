<script>
  //@ts-nocheck
  import { tick, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let text;

  let textarea;

  async function copy() {
    textarea.select();
    document.execCommand("Copy");
    await tick();
    textarea.blur();
    dispatch("copy");
  }

  function copied(node) {
    node.addEventListener('mousedown', onCopy);

    function onCopy() {
      node.classList.remove('copied')
      node.classList.add('copied')
    }

    node.addEventListener('mouseup', offCopy)	

    function offCopy() {
      setTimeout(() => {
        node.classList.remove('copied')
      }, 500)
    }

    return {
    destroy() {
      node.removeEventListener('mousedown', onCopy);
      node.removeEventListener('mouseup', offCopy);
      }
    }
  }
</script>

<main on:click={copy} use:copied on:copy={() => {console.info(`${text} copied to clipboard`)}}>
  <div>  <slot {copy} /></div>
  <span></span>
  <textarea bind:this={textarea} value={text} placeholder={text}/>
</main>

<style>
  main {
    max-width: 20rem;
    background-color: rgba(0, 82, 146, 0.1);
    user-select: none;
    border-radius: 0.5rem;
    cursor: pointer;
    position:relative;
    overflow: hidden;
  }
  main:hover {
    outline: lightgrey solid 0.1em;
  }
  main:global(.copied) {
    animation: flash 0.5s forwards linear normal;
  }
  @keyframes flash {
    0% {
      background:rgba(60, 179, 113, 0.5);;
    }
    100% {
      background:rgba(0, 82, 146, 0.1);
    }
  }
  span {
    background: url(@vscode/codicons/src/icons/files.svg) center no-repeat;
    background-size: 50%;
    height: 100%;
    width: 2.2em;
    position: absolute;
    right: 0;
    top: 0;
  }
  div {
    overflow: scroll;
    height: 100%;
    width: calc(100% - 2.2em);
    padding: 0.5rem;
  }
  textarea {
    left: 0;
    bottom: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
    width: 1px;
    height: 1px;
    border: none;
    display: block;
    position: absolute;
  }
</style>