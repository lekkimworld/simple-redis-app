const express = require("express");
const redis = require("redis");
const exphbs = require("express-handlebars")
const path = require("path");
require("dotenv").config();

const client = (function() {
    if (process.env.REDIS_URL) {
        return redis.createClient({
            'url': process.env.REDIS_URL || "redis://localhost:6379"
        });
    } else if (process.env.REDIS_HOSTNAME && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
        redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, {
            "auth_pass": process.env.REDIS_PASSWORD,
            "tls": {
                "servername": process.env.REDIS_HOSTNAME
            }
        });
    }
})();

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", exphbs({"defaultLayout": "main"}));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    client.get("counter", (err, reply) => {
        let obj = reply ? JSON.parse(reply) : {"counter": 0};
        obj.counter++;
        client.set("counter", JSON.stringify(obj), (err) => {
            res.render("root", obj);
        })
    })
})
app.listen(process.env.PORT || 8080);
