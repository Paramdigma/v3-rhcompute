import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";

// eslint-disable-next-line prettier/prettier
window.rhino3dm().then(rh => {
  console.log(window, rh);
  const app = createApp(App);
  // app.config.globalProperties.$rhino = rh;
  app.prototype.rhino = rh;
  // eslint-disable-next-line no-unused-vars
  app.use(router).mount("#app");
});
