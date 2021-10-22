import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
// eslint-disable-next-line prettier/prettier
window.rhino3dm().then(rh => {
  const app = createApp(App);
  app.config.globalProperties.$rhino = rh;
  app.config.globalProperties.$RhinoCompute = window.RhinoCompute;
  app.use(router).mount("#app");
});
