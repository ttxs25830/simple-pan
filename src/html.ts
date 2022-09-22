export const template = 
`
<!DOCTYPE html>
<html lang="zh">
  <head>
    <title>ls</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      div.func {
        border: 1px solid black;
      }
    </style>
  </head>

  <body>
    <h1>Simple-Pan</h1>
    <div class="func">
      <h3>上传</h3>
      <form
        accept-charset="UTF-8"
        name="upload"
        action="/up"
        enctype="multipart/form-data"
        method="post"
      >
        <input type="file" multiple name="files" />
        <input type="submit" value="确认"></input>
      </form>
    </div>
    <br /><br />
    <div class="func">
      <h3>下载</h3>
      <ul>
        <!-- RELPACE THIS INTO FILE LIST -->
      </ul>
    </div>
  </body>
</html>
`
export const jump = `<script>setTimeout(() => document.location.replace("/ls"), 1500)</script>`
