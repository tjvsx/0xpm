// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter(),
		prerender: { default: true },
		paths: {
			// change below to your repo name
			base: process.env.NODE_ENV === 'development' ? '' : '/0xpm'
		},

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
			resolve: {
				alias: {
					'@douganderson444/ipfs-vite-svelte-kit': path.resolve('src/lib')
				}
			},
			server: {
				fs: {
					strict: false
				}
			},
			build: {
				rollupOptions: {
					plugins: [],
					output: {
						minifyInternalExports: false,
						compact: false,
						sourcemap: true
					}
				},
				minify: false,
				sourcemap: true,
				optimization: {
					minimize: false
				}
			},
			optimization: {
				minimize: false
			}
		}
	}
};

export default config;
