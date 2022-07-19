const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        serif: ['Open Sans', 'sans-serif']
      },
      backgroundImage: theme => ({
        'diamond': "url(static/icons/ruby.svg)",
        'repos': "url(static/icons/repos.svg)",
        'repo-push': "url(@vscode/codicons/src/icons/repo-push.svg)",
        'etherscan': "url(static/icons/etherscan.svg)",
        'sourcify': "url(static/icons/sourcify.svg)",
        'louper': "url(static/icons/louper.svg)",
        'habitat': "url(static/icons/habitat.svg)"
      }),
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
          screens: {
      'sm-max': {'max': '639px'},
      'sm-min': {'min': '639px'},
      // => @media (max-width: 639px) { ... }

    }
    },
  },

  plugins: []
};

module.exports = config;
