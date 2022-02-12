import { App } from "vue";

interface CustomContext {
    app: App<Element>;
}

export type UserModule = (ctx: CustomContext) => void
