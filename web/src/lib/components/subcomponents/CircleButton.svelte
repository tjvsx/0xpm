
<script>
  //@ts-nocheck
  export let func;
  export let char;
</script>



<div on:click={func}><span>{char}</span></div>


<style>
  span {
  @apply font-bold text-center text-white leading-7;
  }
  div {
    @apply w-7 h-7 flex flex-none justify-center items-center bg-slate-400 rounded-full;
  }
  div:hover {
    @apply scale-105 cursor-pointer;
  }

</style>