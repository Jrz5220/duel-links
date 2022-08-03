// github version

const express = require("express");
/* use object document mapper (JavaScript objects to MongoDB documents) instead of native MondoDB driver */
const mongoose = require("mongoose");
/* parses HTTP request body and populates the req.body property with the parsed data */
const bodyParser = require("body-parser");

/* creates an Express application */
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
/* allows express to parse content coming from an HTML form, which is of type application/x-www-form-urlencoded */
app.use(bodyParser.urlencoded({extended: true}));

try {
  mongoose.connect("mongodb+srv://<username>:<password>@cluster0.gt8nl.mongodb.net/<database>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
} catch(error) {
  console.log("could not connect to the mongo database. visit https://mongoosejs.com/docs/connections.html#error-handling for more information.");
}

/*
Schema - defines the type of data to go into a model.
Model - the interface used to connect to a collection within a mongo database.
Document - an instance of a model containing data returned from the database.
 */

const { Schema } = mongoose;
const yugiohCardSchema = mongoose.Schema ({
  htmlId: String,
  imgDir: String,
  name: String,
  type: String,
  effect: String,
  level: Number,
  attribute: String,
  summonRequirement: String,
  atk: Number,
  def: Number
});
const duelSchema = mongoose.Schema({
  duelName: String,
  title: String,
  cards: [{type: Schema.ObjectId, ref: "YugiohCard"}],
  skill: String,
  skillDetail: String,
  containsSkillCard: Boolean,
  skillCardPath: String,
  skillCardName: String,
  skillCardType: String,
  skillCardEffect: String,
  uploadDate: String
});

const YugiohCard = mongoose.model("YugiohCard", yugiohCardSchema);
const VendreadDuel = mongoose.model("Vendread", duelSchema);
const VampireDuel = mongoose.model("Vampire", duelSchema);
const SacredSoldierDuel = mongoose.model("SacredSoldier", duelSchema);
const DinoDuel = mongoose.model("Dino", duelSchema);
const ArchfiendDuel = mongoose.model("Archfiend", duelSchema);
const PsychicDuel = mongoose.model("Psychic", duelSchema);
const AmazonDuel = mongoose.model("Amazon", duelSchema);
const ElementsaberDuel = mongoose.model("Elementsaber", duelSchema);
const RedEyesZombieDuel = mongoose.model("RedEyesZombie", duelSchema);
const GeminiDuel = mongoose.model("Gemini", duelSchema);
const SpecialDuel = mongoose.model("SpecialDuel", duelSchema);
const TurboDuel = mongoose.model("TurboDuel", duelSchema);
const OtherDuel = mongoose.model("OtherDuel", duelSchema);

app.get("/", function(req, res) {
  res.render("index");
});
/* VENDREADS */
app.get("/vendread-v-shiranui", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-shiranui", "vendread");
});
app.get("/vendread-v-chimeratech-rampage-dragon", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-chimeratech-rampage-dragon", "vendread");
});
app.get("/vendread-v-elemental-heroes", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-elemental-heroes", "vendread");
});
app.get("/vendread-v-sartorius-desperado", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-sartorius-desperado", "vendread");
});
app.get("/vendread-v-blackwings", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-blackwings", "vendread");
});
app.get("/vendread-v-top-duelist", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-top-duelist", "vendread");
});
app.get("/vendread-v-invoker", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-invoker", "vendread");
});
app.get("/vendread-v-yubel", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-yubel", "vendread");
});
app.get("/vendread-v-burn", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-burn", "vendread");
});
app.get("/vendread-v-cyber-end-dragon", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-cyber-end-dragon", "vendread");
});
app.get("/vendread-v-desperado-barrel-dragon", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-desperado-barrel-dragon", "vendread");
});
app.get("/vendread-v-dark-magician", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-dark-magician", "vendread");
});
app.get("/vendread-v-magnets", function(req, res) {
  renderDuelVideoPage(res, VendreadDuel, "vendread-v-magnets", "vendread");
});
/* VAMPIRES */
app.get("/vampire-v-ancient-gears", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-ancient-gears", "vampire");
});
app.get("/vampire-v-fortune-ladies", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-fortune-ladies", "vampire");
});
app.get("/vampire-v-cerulean-sacred-phoenix", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-cerulean-sacred-phoenix", "vampire");
});
app.get("/vampire-v-burn", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-burn", "vampire");
});
app.get("/vampire-v-subterrors", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-subterrors", "vampire");
});
app.get("/vampire-v-magician-girls", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-magician-girls", "vampire");
});
app.get("/vampire-v-relinquished", function(req, res) {
  renderDuelVideoPage(res, VampireDuel, "vampire-v-relinquished", "vampire");
});
/* SACRED SOLDIER */
app.get("/sacred-soldier-v-silent-magician", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-silent-magician", "sacredsoldier");
});
app.get("/sacred-soldier-v-blue-eyes", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-blue-eyes", "sacredsoldier");
});
app.get("/sacred-soldier-ftk", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-ftk", "sacredsoldier");
});
app.get("/sacred-soldier-v-destiny-heroes", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-destiny-heroes", "sacredsoldier");
});
app.get("/sacred-soldier-v-noble-knights", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-noble-knights", "sacredsoldier");
});
app.get("/sacred-soldier-v-amazoness", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-amazoness", "sacredsoldier");
});
app.get("/sacred-soldier-v-masked-beast-des-gardius", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-v-masked-beast-des-gardius", "sacredsoldier");
});
app.get("/sacred-soldier-lava-golem-combo", function(req, res) {
  renderDuelVideoPage(res, SacredSoldierDuel, "sacred-soldier-lava-golem-combo", "sacredsoldier");
});
/* DINOS */
app.get("/dino-v-subterrors", function(req, res) {
  renderDuelVideoPage(res, DinoDuel, "dino-v-subterrors", "dino");
});
app.get("/dino-v-gravekeepers", function(req, res) {
  renderDuelVideoPage(res, DinoDuel, "dino-v-gravekeepers", "dino");
});
app.get("/dino-v-sartorius-desperado", function(req, res) {
  renderDuelVideoPage(res, DinoDuel, "dino-v-sartorius-desperado", "dino");
});
/* ARCHFIENDS */
app.get("/archfiend-v-evil-heroes", function(req, res) {
  renderDuelVideoPage(res, ArchfiendDuel, "archfiend-v-evil-heroes", "archfiend");
});
app.get("/archfiend-v-gladiator-beasts", function(req, res) {
  renderDuelVideoPage(res, ArchfiendDuel, "archfiend-v-gladiator-beasts", "archfiend");
});
app.get("/archfiend-v-dragons", function(req, res) {
  renderDuelVideoPage(res, ArchfiendDuel, "archfiend-v-dragons", "archfiend");
});
/* PSYCHICS */
app.get("/psychic-1", function(req, res) {
  renderDuelVideoPage(res, PsychicDuel, "psychic-1", "psychic");
});
app.get("/psychic-2", function(req, res) {
  renderDuelVideoPage(res, PsychicDuel, "psychic-2", "psychic");
});
/* AMAZON */
app.get("/amazon-mirror-match-1", function(req, res) {
  renderDuelVideoPage(res, AmazonDuel, "amazon-mirror-match-1", "amazon");
});
app.get("/amazon-mirror-match-2", function(req, res) {
  renderDuelVideoPage(res, AmazonDuel, "amazon-mirror-match-2", "amazon");
});
app.get("/amazon-v-anti-trap", function(req, res) {
  renderDuelVideoPage(res, AmazonDuel, "amazon-v-anti-trap", "amazon");
});
/* ELEMENTSABER */
app.get("/elementsaber-v-burn", function(req, res) {
  renderDuelVideoPage(res, ElementsaberDuel, "elementsaber-v-burn", "elementsaber");
});
/* REZD */
app.get("/rezd-v-sylvans", function(req, res) {
  renderDuelVideoPage(res, RedEyesZombieDuel, "rezd-v-sylvans", "rezd");
});
app.get("/rezd-v-armed-dragon", function(req, res) {
  renderDuelVideoPage(res, RedEyesZombieDuel, "rezd-v-armed-dragon", "rezd");
});
app.get("/rezd-v-amazoness", function(req, res) {
  renderDuelVideoPage(res, RedEyesZombieDuel, "rezd-v-amazoness", "rezd");
});
/* GEMINI */
app.get("/gemini-v-batteryman", function(req, res) {
  renderDuelVideoPage(res, GeminiDuel, "gemini-v-batteryman", "gemini");
});
/* SPECIAL DUEL */
app.get("/dark-necrofear-special-duel-1", function(req, res) {
  renderDuelVideoPage(res, SpecialDuel, "dark-necrofear-special-duel-1", "specialduel");
});
app.get("/dark-necrofear-special-duel-2", function(req, res) {
  renderDuelVideoPage(res, SpecialDuel, "dark-necrofear-special-duel-2", "specialduel");
});
/* TURBO DUEL */
app.get("/td-elementsaber-v-lunalights", function(req, res) {
  renderDuelVideoPage(res, TurboDuel, "td-elementsaber-v-lunalights", "turboduel");
});
app.get("/td-vendread-v-shiranui", function(req, res) {
  renderDuelVideoPage(res, TurboDuel, "td-vendread-v-shiranui", "turboduel");
});
/* OTHER DUEL */
app.get("/bakura-otk", function(req, res) {
  renderDuelVideoPage(res, OtherDuel, "bakura-otk", "otherduel");
});
app.get("/beast-warriors-v-six-samurai", function(req, res) {
  renderDuelVideoPage(res, OtherDuel, "beast-warriors-v-six-samurai", "otherduel");
});
app.get("/constellar-v-bewd", function(req, res) {
  renderDuelVideoPage(res, OtherDuel, "constellar-v-bewd", "otherduel");
});
app.get("/wiraqocha-rasca", function(req, res) {
  renderDuelVideoPage(res, OtherDuel, "wiraqocha-rasca", "otherduel");
});

function renderDuelVideoPage(res, theDuelModel, theDuelName, theCollectionType) {
  // findOne() - finds a document with the specified duel name and returns it as a Query object
  // populate() - populates the "cards" path within the returned document with data from a collection defined by the yugioh card schema
  // exec() - executes the query and performs actions on the results returned from the Query object
  theDuelModel.findOne({duelName: theDuelName}).populate("cards").exec(function(err, duelFound) {
    if(err) {
      console.log("error: " + err);
      res.redirect(500, "/");
    } else if(duelFound === null) {
      console.log(theDuelName + ": duel could not be found");
      res.status(404).render("duel-not-found");
    } else {
      let isMonsterArray = new Array(duelFound.cards.length);
      for(let i = 0; i < duelFound.cards.length; i++) {
        if(duelFound.cards[i].attribute !== undefined && duelFound.cards[i].attribute !== null) {
          isMonsterArray[i] = true;
        } else {
          isMonsterArray[i] = false;
        }
      } // end for loop
      res.render("duel-video", {duel: duelFound, isMonster: isMonsterArray, numOfCards: isMonsterArray.length, collection: theCollectionType});
    }
  });
}

// if deploying on Heroku, specify correct port (visit Heroku for proper configuration)
let port = process.env.PORT;
if(port == "" || port == null) {
  port = "3000";
}
console.log("port: " + port);
app.listen(port, function(req, res) {
  console.log("Server successfully running");
});
