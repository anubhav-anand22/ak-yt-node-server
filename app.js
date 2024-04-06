const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/api/download-vid", async (req, res) => {
  try {
    const id = req.query?.id || "";
    if (!id) return res.status(400).send("Id is required");

    const url = "http://www.youtube.com/watch?v=" + id;

    const info = await ytdl.getInfo(url);

    const format = info.formats.find((e) => e.itag === 140 || e.itag === 139);

    if (!format) return res.status(404).send("No format found");

    res.setHeader("Content-Type", format.mimeType);
    res.setHeader("Content-Length", format.contentLength);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizeTxt(info.videoDetails.title)}.m4a"`
    );

    ytdl
      .downloadFromInfo(info, {
        format,
      })
      .pipe(res);
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong");
    console.log(e);
  }
});

const sanitizeTxt = (str = "") => {
  let out = "";
  const allowed =
    "abcdfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 ";
  for (let i of allowed) {
    if (str.includes(i)) out += i;
  }
  return out;
};

app.listen(port, () => {
  console.log("Server is up on port: " + port);
});
