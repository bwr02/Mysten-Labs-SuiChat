// eslint-disable-next-line import/no-anonymous-default-export
// const flowbite = require("flowbite-react/tailwind");
import flowbite from "flowbite-react/tailwind";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content(),],
  theme: {
  	extend: {},
  },
  plugins: [
    flowbite.plugin(),
  ],
};