export default {
  fetch(): Promise<Response> {
    return Promise.resolve(new Response("Hello World!"))
  },
} satisfies ExportedHandler<Env>
