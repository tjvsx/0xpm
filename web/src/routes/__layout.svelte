<script lang="ts">
	import '../app.css';
</script>

<slot />


<style global>
	:root {
		font-family: 'Open Sans', sans-serif;
		--primary: white;
		--secondary: black;
		--accent: slategrey;
	}
	h1 {
    @apply font-bold text-3xl;
  }
  h2 {
    @apply font-bold text-2xl;
  }
  h3 {
    @apply font-bold text-xl;
  }
  h4 {
    @apply font-bold text-lg;
  }
  h5 {
    @apply font-bold text-base;
  }
	button {
		@apply bg-black text-white font-semibold rounded-full py-2 px-4 cursor-pointer shadow-md;
	}
	button:hover {
		@apply opacity-80 ;
	}
  .menu-link {
    @apply flex justify-center items-center py-2 w-1/2; 
  }
	.menu-link:hover {
    @apply cursor-pointer;
  }
	input {
    @apply rounded-full px-3 py-1;
  }
	input:focus, input:hover {
		@apply cursor-default outline-black;
	}
	select:focus, select:hover {
		@apply outline-none cursor-default;
	}
	.resizer { @apply absolute w-2 h-full right-0 cursor-col-resize z-20; }
	.hide-resizer .resizer { @apply bg-transparent; } 
	.resizer.selected { @apply bg-slate-200 opacity-30; }

	.mover {
		position: absolute;
		box-sizing: border-box; 
		width: 100%;
		cursor: grab;
		height: 4em;
		@apply z-30;
	}

	.grabber {
		position: absolute;
		box-sizing: border-box; 
	}
	
	.grabber.right {
		width: 1em;
		height: calc(100% - 1em);
		top: 1em;
		right: -0.5em;
		cursor: col-resize;
	}
	
	.grabber.left {
		width: 1em;
		height: 100%;
		left: -0.5em;
		cursor: col-resize;
	}
	
	.grabber.bottom {
		height: 1em;
		width: 100%;
		bottom: -0.5em;
		cursor: row-resize;
	}
	
	.grabber.bottom-left {
		height: 2em;
		width: 2em;
		bottom: -0.5em;
		left: -0.5em;
		cursor: sw-resize;
		border-radius: 100%;
	}
	
	.grabber.bottom-right {
		height: 2rem;
		width: 2rem;
		bottom: -0.5em;
		right: -0.5em;
		cursor: se-resize;
		border-radius: 100%;
	}
	
	/* .grabber.selected {
		border: solid 1px black;
	} */

</style>