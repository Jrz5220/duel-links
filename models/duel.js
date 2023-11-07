const mongoose = require("mongoose");

/*
Schema - defines the type of data to go into a model.
Model - the interface used to connect to a collection within a mongo database.
Document - an instance of a model containing data returned from the database.
          you should not create an instance of a document. the model instance returns the document.
*/

const Schema = mongoose.Schema;
const yugiohCardSchema = new Schema({
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
const YugiohCard = mongoose.model("YugiohCard", yugiohCardSchema);
const duelSchema = new Schema({
  duelName: String,
  title: String,
  // used by the mongoose "populate" method to reference documents in the db collection "yugiohCards"
  // https://mongoosejs.com/docs/populate.html
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

module.exports = {
    vendreadDuel: mongoose.model("Vendread", duelSchema),
    vampireDuel: mongoose.model("Vampire", duelSchema),
    sacredSoldierDuel: mongoose.model("SacredSoldier", duelSchema),
    dinoDuel: mongoose.model("Dino", duelSchema),
    archfiendDuel: mongoose.model("Archfiend", duelSchema),
    psychicDuel: mongoose.model("Psychic", duelSchema),
    amazonDuel: mongoose.model("Amazon", duelSchema),
    elementsaberDuel: mongoose.model("Elementsaber", duelSchema),
    redEyesZombieDuel: mongoose.model("RedEyesZombie", duelSchema),
    geminiDuel: mongoose.model("Gemini", duelSchema),
    specialDuel: mongoose.model("SpecialDuel", duelSchema),
    turboDuel: mongoose.model("TurboDuel", duelSchema),
    otherDuel: mongoose.model("OtherDuel", duelSchema)
}