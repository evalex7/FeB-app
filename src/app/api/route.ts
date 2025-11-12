'use server';
const something = null; // щоб збірка не падала

const { GET, POST } = defineNextJsHandler({
  ai,
  flows: [],
});

export { GET, POST };
