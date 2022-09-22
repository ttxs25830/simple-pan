import express from "express";
import { existsSync, renameSync, readdirSync, mkdirSync } from "fs";
import path from "path";
import CONFIG from "./config.json";
import render from "./render";
import multer from "multer";
import { jump } from "./html";

const PORT = CONFIG.port;
const PATH = CONFIG.filePath;
if(!existsSync(PATH)){
    mkdirSync(PATH)
}
const TMP_PATH = CONFIG.tmp;
if(!existsSync(TMP_PATH)){
    mkdirSync(TMP_PATH)
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
    response.status(200).send(render(list));
  })
  .get("/down/*", (request, response) => {
    let urll = request.url.split("/");
    let fp = "";
    if (urll.length != 3) {
      response.status(403).send("您无权访问该目录！"+jump);
      return;
    } else {
      fp = path.join(PATH, urll[2]);
    }
    if (!existsSync(fp) || path.basename(fp).startsWith(".")) {
      response.status(404).send("您所请求的文件不存在！"+jump);
      return;
    }
    response.sendFile(fp, {
      headers: {
        "Content-Disposition": `attachment; filename="${path.basename(fp)}"`,
      },
    });
  })
  .post("/up", (request, response) => {
    if (request.files) {
      let ill = 0;
      let reTask: { [index: string]: string } = {};
      (request.files as Express.Multer.File[]).forEach(
        (value: Express.Multer.File) => {
          if (value.originalname.startsWith(".")) {
            ill = Math.max(ill, 3);
          }
          if (existsSync(path.join(PATH, value.originalname))) {
            ill = Math.max(ill, 2);
          }
          if (path.join(PATH, value.originalname) in reTask) {
            ill = Math.max(ill, 1);
          }
          reTask[path.join(PATH, value.originalname)] = value.path;
        }
      );
      if (ill) {
        if (ill == 1) {
          response
            .status(422)
            .send("上传文件内部有重名文件！请更换名字后重试！"+jump);
        } else if (ill == 2) {
          response.status(409).send("与服务端已有文件重名！请更换名字后重试！"+jump);
        } else {
          response.status(403).send("您无权上传隐藏文件(以'.'开头的文件)！"+ jump);
        }
      } else {
        for (let i in reTask) {
          renameSync(reTask[i], i);
        }
        response.status(201).send("上传成功！"+jump);
      }
    } else {
      response.status(400).send("您的请求与格式不符！" + jump);
    }
  });

app.listen(PORT, () => console.log(`App listen on port ${PORT}`));
