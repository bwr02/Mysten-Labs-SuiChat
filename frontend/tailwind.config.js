// eslint-disable-next-line import/no-anonymous-default-export
// const flowbite = require("flowbite-react/tailwind");
import flowbite from "flowbite-react/tailwind";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content(),],
  theme: {
  	extend: {
      colors: {
        'dark-blue': '#1f2937',
        'medium-blue': '#2e3845',
        'light-blue': '#3e4b5c',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
};