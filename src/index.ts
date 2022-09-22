import express from "express";
import { existsSync, readdirSync, mkdirSync, readFileSync, unlink } from "fs";
import mv from "mv";
import path from "path";
import CONFIG_j from "./config.json";
import render from "./render";
import multer from "multer";
import { jump } from "./html";
let CONFIG: {
  port: any;
  filePath: any;
  tmp: any;
  cleanTime: any;
  external?: boolean;
};
if (typeof CONFIG_j["external"] == "string") {
  CONFIG = JSON.parse(
    readFileSync(CONFIG_j["external"] as string, {
      encoding: "utf-8",
    })
  );
} else {
  CONFIG = CONFIG_j;
}
const PORT = CONFIG.port;
const PATH = path.isAbsolute(CONFIG.filePath)
  ? CONFIG.filePath
  : path.join(process.cwd(), CONFIG.filePath);
if (!existsSync(PATH)) {
  mkdirSync(PATH);
}
const TMP_PATH = path.isAbsolute(CONFIG.tmp)
  ? CONFIG.tmp
  : path.join(process.cwd(), CONFIG.tmp);
if (!existsSync(TMP_PATH)) {
  mkdirSync(TMP_PATH);
}
const CLEAN_TIME = CONFIG.cleanTime * 60000;
let lastClean = 0;

setInterval(async () => {
  if (Math.floor(Date.now() / CLEAN_TIME) > lastClean) {
    lastClean = Math.floor(Date.now() / CLEAN_TIME);
    await Promise.all(readdirSync(PATH)
      .filter((v) => !v.startsWith("."))
      .map((v) => path.join(PATH, v))
      .map(
        (v) =>
          new Promise<void>((res, rej) =>
            unlink(v, (err) => (err ? rej(err) : res()))
          )
      ));
  }
}, 1000)

function readableTimeLen(time: number) {
  time = Math.floor(time/60000)
  let m = time % 60
  time = Math.floor(time/60)
  let h = time % 60
  time = Math.floor(time/60)
  let d = time % 24
  return `${d.toString(10)}天${h.toString(10)}小时${m}分钟`
}
const app = express();
app.use(
  multer({
    dest: TMP_PATH,
  }).array("files")
);

app
  .get("/", (request, response) => {
    response.redirect("ls");
  })
  .get("/ls", (request, response) => {
    let list = readdirSync(PATH).filter((v) => !v.startsWith("."));
    response
      .status(200)
      .send(render(list, readableTimeLen(CLEAN_TIME - (Date.now() % CLEAN_TIME))));
  })
  .get("/down/*", (request, response) => {
    let urll = request.url.split("/");
    let fp = "";
    if (urll.length != 3) {
      response.status(400).send("无法理解的访问路径！" + jump);
      return;
    } else {
      fp = path.join(PATH, decodeURIComponent(urll[2]));
    }
    if (!existsSync(fp) || path.basename(fp).startsWith(".")) {
      response.status(404).send("您所请求的文件不存在！" + jump);
      return;
    }
    response.sendFile(fp, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          path.basename(fp)
        )}"`,
      },
    });
  })
  .post("/up", (request, response) => {
    if (request.files) {
      let ill = 0;
      let reTask: { [index: string]: string } = {};
      (request.files as Express.Multer.File[]).forEach(
        (value: Express.Multer.File) => {
          const oriName = Buffer.from(value.originalname, "latin1").toString(
            "utf-8"
          );
          if (oriName.startsWith(".")) {
            ill = Math.max(ill, 3);
          }
          if (existsSync(path.join(PATH, oriName))) {
            ill = Math.max(ill, 2);
          }
          if (path.join(PATH, oriName) in reTask) {
            ill = Math.max(ill, 1);
          }
          reTask[path.join(PATH, oriName)] = value.path;
        }
      );
      if (ill) {
        if (ill == 1) {
          response
            .status(422)
            .send("上传文件内部有重名文件！请更换名字后重试！" + jump);
        } else if (ill == 2) {
          response
            .status(409)
            .send("与服务端已有文件重名！请更换名字后重试！" + jump);
        } else {
          response
            .status(403)
            .send("您无权上传隐藏文件(以'.'开头的文件)！" + jump);
        }
      } else {
        for (let i in reTask) {
          mv(reTask[i], i, (err) => (err ? console.log(err) : 0));
        }
        response.status(201).send("上传成功！" + jump);
      }
    } else {
      response.status(400).send("您的请求与格式不符！" + jump);
    }
  });

app.listen(PORT, () => console.log(`App listen on port ${PORT}`));
