import type { Preview } from "@storybook/react";

import "./preview.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "paper",
      values: [
        { name: "paper", value: "#f7f7f5" },
        { name: "white", value: "#ffffff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
