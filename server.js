// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const Instagram = require("instagram-web-api");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.get("/process", async (request, response) => {
  try {
    let username = request.query.username;

    let posts = await getPosts(username);

    let data = [];

    for (let c = 0, i = posts.length; c < i; c++) {
      data.push({
        likes: posts[c].node.edge_media_preview_like.count,
        thumbnail: posts[c].node.thumbnail_src,
        caption: posts[c].node.edge_media_to_caption.edges.length
          ? posts[c].node.edge_media_to_caption.edges[0].node.text
          : "",
        shortcode: posts[c].node.shortcode
      });
    }

    data.sort((a, b) => {
      if (a.likes < b.likes) return 1;
      if (b.likes < a.likes) return -1;

      return 0;
    });

    response.send({
      message: true,
      posts: data
    });
  } catch (e) {
    console.error(e);

    response.send({
      message: false,
      posts: []
    });
  }
});

async function getPosts(username) {
  let client = new Instagram(username);
  let posts = [];
  let page = false;

  do {
    let pagePosts = await getPage(username, client, page);

    page = pagePosts.page;
    posts.push(...pagePosts.data);
  } while (page !== false);

  return posts;
}

async function getPage(username, client, page) {
  let result = {
    data: [],
    page: false
  };

  let params = {
    username: username,
    first: 50
  };

  if (page) {
    params.after = page;
  }

  let data = await client.getPhotosByUsername(params);

  if (data.user.edge_owner_to_timeline_media.page_info.has_next_page) {
    result.page = data.user.edge_owner_to_timeline_media.page_info.end_cursor;
  } else {
    result.page = false;
  }

  if (data.user.edge_owner_to_timeline_media.edges.length) {
    for (
      let l = data.user.edge_owner_to_timeline_media.edges.length, c = 0;
      c < l;
      c++
    ) {
      result.data.push(data.user.edge_owner_to_timeline_media.edges[c]);
    }
  }

  return result;
}

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
