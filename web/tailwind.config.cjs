const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        serif: ['Open Sans', 'sans-serif']
      },
      backgroundImage: theme => ({
        'diamond': "url(@vscode/codicons/src/icons/ruby.svg)",
        'repo': "url(@vscode/codicons/src/icons/repo.svg)",
        'disconnect': "url(@vscode/codicons/src/icons/debug-disconnect.svg)",
        'repo-push': "url(@vscode/codicons/src/icons/repo-push.svg)",
        'etherscan': "url($lib/icons/etherscan.svg)",
        'sourcify': "url($lib/icons/sourcify.svg)",
        'habitat': "url($lib/icons/habitat.svg)"
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
