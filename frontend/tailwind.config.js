// eslint-disable-next-line import/no-anonymous-default-export
// const flowbite = require("flowbite-react/tailwind");
import flowbite from "flowbite-react/tailwind";
// import lineClamp from '@tailwindcss/line-clamp';
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content(),],
  theme: {
  	extend: {
      colors: {
        'dark-blue': '#1f2937',
        'medium-blue': '#2e3845',
        'light-blue': '#303a47',
        'lighter-blue': '#374454'
      }
    },
  },
  plugins: [
    flowbite.plugin(),
    // lineClamp,
    // Custom plugin to hide scrollbars
    function({ addUtilities }) {
      const newUtilities = {
        // Utility to hide scrollbar for all browsers
        '.no-scrollbar': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none', /* Firefox */
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none', /* Chrome, Safari, Opera */
        },
      };
      addUtilities(newUtilities);
    },
  ],
};