import { initStaticPage } from "../shell.js";
import { initNetworkPage } from "../main.js";

initStaticPage();
await initNetworkPage();
