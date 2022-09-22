# simple-pan
A mini web file server allow everyone up and down load files
# 编译
- 运行`npm ci`
- 运行`npm run build`
- 编译后的代码应会存放在`dist/index.js`
# 运行
- 运行`node ./dist/index.js`
- 等待直到程序输出`App listen on port <你的端口>`
# 配置
调整`src/config.json`后重新编译
### port
服务器监听的端口
### filePath
服务器存储云盘中的文件的路径
### tmp
该服务器在进行验证前临时存储上传的文件的路径，强烈不建议将其与filePath放入不同分区或不同物理磁盘下