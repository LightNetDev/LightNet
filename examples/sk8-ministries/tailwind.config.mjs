import { lightnetStyles } from "lightnet/tailwind.config.ts"
/**
 * Tailwind CSS configuration for LightNet projects.
 *
 * This file customizes the appearance of your LightNet site by defining styles
 * such as the primary color. The configuration uses a preset provided by LightNet,
 * ensuring consistent styling and best practices.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  presets: [
    /**
     * Applies the LightNet Tailwind CSS preset to your project.
     * This ensures a consistent base styling for all components.
     */
    lightnetStyles({
      /**
       * Defines the primary color for your site.
       *
       * The primary color is applied to various UI elements, such as buttons,
       * links, and hover states. Choose a color that aligns with your brand
       * and provides good contrast against a white background for accessibility.
       *
       * Example:
       * - #14004B is a dark purple
       */
      primaryColor: "#14004B",
    }),
  ],
}
