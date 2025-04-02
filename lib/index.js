var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var Config = import_koishi.Schema.object({
  prefix: import_koishi.Schema.string().default("记录").description("返回结果的自定义开头")
});
var inject = ["database"];
function apply(ctx, config) {
  if (!ctx.database) {
    throw new Error("需要数据库服务支持！");
  }
  ctx.model.extend("custom_data", {
    id: {
      type: "unsigned",
      length: 11
    },
    name: {
      type: "string",
      length: 255
    },
    reason: {
      type: "text"
    },
    creator: {
      type: "string",
      length: 255
    }
  }, {
    primary: "id",
    autoInc: true
  });
  ctx.command("add <name> <reason> <creator>", "添加新数据").action(async ({ session }, name, reason, creator) => {
    if (!name || !reason || !creator) {
      return `${config.prefix}参数不全，请按格式输入：名称 原因 创建者`;
    }
    try {
      const existing = await ctx.database.get("custom_data", { name });
      if (existing.length > 0) {
        return `数据[${name}]已存在，无法重复添加（原记录创建者：${existing[0].creator}）`;
      }
      await ctx.database.create("custom_data", {
        name,
        reason,
        creator
      });
      return `数据[${name}]添加成功！`;
    } catch (error) {
      ctx.logger("plugin").error("添加数据失败:", error);
      return `添加失败，请检查数据格式或联系管理员`;
    }
  });
  ctx.command("remove <name>", "删除指定数据").option("creator", "-c <creator>").action(async ({ session, options }, name) => {
    if (!name) return `请输入要删除的名称`;
    try {
      const condition = options.creator ? { name, creator: options.creator } : { name };
      const result = await ctx.database.remove("custom_data", condition);
      return result ? `数据[${name}]已删除完成` : `删除失败（未找到匹配数据）`;
    } catch (error) {
      ctx.logger("plugin").error("删除操作失败:", error);
      return `删除失败（数据库错误）`;
    }
  });
  ctx.command("search [name]", "查询数据").option("creator", "-c <creator>").action(async ({ session, options }, name) => {
    try {
      const condition = {};
      if (name) condition.name = name;
      if (options.creator) condition.creator = options.creator;
      const data = await ctx.database.get("custom_data", condition);
      if (!data.length) return `没有找到匹配数据`;
      return data.map(
        (item) => `${config.prefix}：名称「${item.name}」原因「${item.reason}」处理人「${item.creator}」`
      ).join("\n");
    } catch (error) {
      ctx.logger("plugin").error("查询数据失败:", error);
      return `查询失败，请稍后再试`;
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject
});
