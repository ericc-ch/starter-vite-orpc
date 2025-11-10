// for some reason alchemy/vite needs entrypoint otherwise it'll return 404
export default {
  fetch: () => new Response("Hello from Web!"),
}
