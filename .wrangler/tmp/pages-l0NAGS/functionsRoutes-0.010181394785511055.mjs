import { onRequest as __api_nav_categories_add_ts_onRequest } from "/home/project/functions/api/nav-categories/add.ts"
import { onRequest as __api_nav_categories_delete_ts_onRequest } from "/home/project/functions/api/nav-categories/delete.ts"
import { onRequest as __api_nav_categories_list_ts_onRequest } from "/home/project/functions/api/nav-categories/list.ts"
import { onRequest as __api_nav_categories_sort_ts_onRequest } from "/home/project/functions/api/nav-categories/sort.ts"
import { onRequest as __api_nav_categories_update_ts_onRequest } from "/home/project/functions/api/nav-categories/update.ts"
import { onRequest as __api_nav_links_add_ts_onRequest } from "/home/project/functions/api/nav-links/add.ts"
import { onRequest as __api_nav_links_delete_ts_onRequest } from "/home/project/functions/api/nav-links/delete.ts"
import { onRequest as __api_nav_links_list_ts_onRequest } from "/home/project/functions/api/nav-links/list.ts"
import { onRequest as __api_nav_links_sort_ts_onRequest } from "/home/project/functions/api/nav-links/sort.ts"
import { onRequest as __api_nav_links_update_ts_onRequest } from "/home/project/functions/api/nav-links/update.ts"
import { onRequestPost as __api_admin_change_password_js_onRequestPost } from "/home/project/functions/api/admin-change-password.js"
import { onRequestPost as __api_admin_login_js_onRequestPost } from "/home/project/functions/api/admin-login.js"
import { onRequestPost as __api_admin_verify_token_js_onRequestPost } from "/home/project/functions/api/admin-verify-token.js"

export const routes = [
    {
      routePath: "/api/nav-categories/add",
      mountPath: "/api/nav-categories",
      method: "",
      middlewares: [],
      modules: [__api_nav_categories_add_ts_onRequest],
    },
  {
      routePath: "/api/nav-categories/delete",
      mountPath: "/api/nav-categories",
      method: "",
      middlewares: [],
      modules: [__api_nav_categories_delete_ts_onRequest],
    },
  {
      routePath: "/api/nav-categories/list",
      mountPath: "/api/nav-categories",
      method: "",
      middlewares: [],
      modules: [__api_nav_categories_list_ts_onRequest],
    },
  {
      routePath: "/api/nav-categories/sort",
      mountPath: "/api/nav-categories",
      method: "",
      middlewares: [],
      modules: [__api_nav_categories_sort_ts_onRequest],
    },
  {
      routePath: "/api/nav-categories/update",
      mountPath: "/api/nav-categories",
      method: "",
      middlewares: [],
      modules: [__api_nav_categories_update_ts_onRequest],
    },
  {
      routePath: "/api/nav-links/add",
      mountPath: "/api/nav-links",
      method: "",
      middlewares: [],
      modules: [__api_nav_links_add_ts_onRequest],
    },
  {
      routePath: "/api/nav-links/delete",
      mountPath: "/api/nav-links",
      method: "",
      middlewares: [],
      modules: [__api_nav_links_delete_ts_onRequest],
    },
  {
      routePath: "/api/nav-links/list",
      mountPath: "/api/nav-links",
      method: "",
      middlewares: [],
      modules: [__api_nav_links_list_ts_onRequest],
    },
  {
      routePath: "/api/nav-links/sort",
      mountPath: "/api/nav-links",
      method: "",
      middlewares: [],
      modules: [__api_nav_links_sort_ts_onRequest],
    },
  {
      routePath: "/api/nav-links/update",
      mountPath: "/api/nav-links",
      method: "",
      middlewares: [],
      modules: [__api_nav_links_update_ts_onRequest],
    },
  {
      routePath: "/api/admin-change-password",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_change_password_js_onRequestPost],
    },
  {
      routePath: "/api/admin-login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_login_js_onRequestPost],
    },
  {
      routePath: "/api/admin-verify-token",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_verify_token_js_onRequestPost],
    },
  ]