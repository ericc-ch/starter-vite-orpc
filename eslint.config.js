import config from "@echristian/eslint-config"

/**
 * @type {import('@echristian/eslint-config').Config}
 */
export default config({
  jsx: {
    enabled: true,
    a11y: true,
  },
  react: {
    enabled: true,
  },
  reactHooks: {
    enabled: true,
  },
  prettier: {
    plugins: ["prettier-plugin-tailwindcss"],
  },
})
