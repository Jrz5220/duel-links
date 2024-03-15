const router = require("express").Router();
const User = require("./../models/user");
const DuelModel = require("./../models/duel");

function updateFavBtn(theUsername, theDuel) {
    return new Promise((resolve, reject) => {
        User.findOne({username: theUsername}, function(err, foundUser) {
            if(err) {
                reject("You were logged out due to a server error. Please try again.");
            } else if(!foundUser || foundUser === null) {
                reject("Your username could not be authenticated. Please sign in again.");
            } else {
                let vidIsFav = false;
                for(let i = 0; i < foundUser.favorites.length; i++) {
                    if(foundUser.favorites[i].duelTitle === theDuel.title)
                        vidIsFav = true;
                }
                if(vidIsFav)
                    resolve("isFavorite");
                else
                    resolve(null);
            }
        });
    });
}

function renderDuelVideoPage(theReq, theRes, duelModel, theDuelName, collectionType) {
    duelModel.findOne({duelName: theDuelName}).populate("cards").exec(function(err, duelFound) {
        if(err) {
            theRes.status(500).json({error: err.name, message:"There was an error locating the duel video."});
        } else if(!duelFound) {
            theRes.status(404).render("redirect", {pageTitle: "Duel Not Found", containsUserData: false, displayUserData: null, theHeader: "Duel Not Found", theMessage: "Sorry, but the duel you were looking for could not be found. You can notify me about this problem by email or try selecting another video to watch.", hasAnotherLink: true, theLink: "https://jrz5220.github.io/felixlazo/contact.html", linkText: "Email Me"});
        } else {
            let isMonsterArray = new Array(duelFound.cards.length);
            let isVidFavorite = null;
            for(let i = 0; i < duelFound.cards.length; i++) {
                isMonsterArray[i] = false;
                if(duelFound.cards[i].attribute !== undefined && duelFound.cards[i].attribute !== null) {
                    isMonsterArray[i] = true;
                }
            }
            if(theReq.isAuthenticated()) {
                async function callUpdateFavBtn(theUsername, theDuel) {
                    try {
                        isVidFavorite = await updateFavBtn(theUsername, theDuel);
                        theRes.render("duel-video", {duel: duelFound, isMonster: isMonsterArray, numOfCards: isMonsterArray.length, collection: collectionType, isFavorite: isVidFavorite, isLoggedIn: true, hasServerMsg: false, theMsg: null});
                    } catch(err) {
                        theReq.app.enable("hasServerMsg");
                        theReq.app.set("theMsg", err);
                        theRes.redirect("/logout");
                    }
                }
                callUpdateFavBtn(theReq.user.username, duelFound);
                // update user's history
                User.findOne({username: theReq.user.username}, function(err, foundUser) {
                    if(err) {
                        theReq.app.enable("hasServerMsg");
                        theReq.app.set("theMsg", "A server error forced a log out. Please sign in again.");
                        theRes.redirect("/logout");
                    } else if(!foundUser) {
                        theReq.app.enable("hasServerMsg");
                        theReq.app.set("theMsg", "unauthorized username. Please sign in again.");
                        theRes.redirect("/logout");
                    } else {
                        let isDuplicate = false;
                        for(let i = 0; i < foundUser.history.length; i++) {
                            if(duelFound.title === foundUser.history[i].duelTitle)
                                isDuplicate = true;
                        }
                        if(!isDuplicate) {
                            if(foundUser.history.length > 4)
                                foundUser.history.pop();
                            foundUser.history.unshift({duelTitle: duelFound.title, duelName: duelFound.duelName});
                            foundUser.save();
                        }
                    }
                });
            } else {
                theRes.render("duel-video", {duel: duelFound, isMonster: isMonsterArray, numOfCards: isMonsterArray.length, collection: collectionType, isFavorite: isVidFavorite, isLoggedIn: false, hasServerMsg: theReq.app.get("hasServerMsg"), theMsg: theReq.app.get("theMsg")});
            }
        }
    });
}

/* VENDREADS */
router.get("/vendread-v-shiranui", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-shiranui", "vendread");
});
router.get("/vendread-v-chimeratech-rampage-dragon", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-chimeratech-rampage-dragon", "vendread");
});
router.get("/vendread-v-elemental-heroes", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-elemental-heroes", "vendread");
});
router.get("/vendread-v-sartorius-desperado", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-sartorius-desperado", "vendread");
});
router.get("/vendread-v-blackwings", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-blackwings", "vendread");
});
router.get("/vendread-v-top-duelist", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-top-duelist", "vendread");
});
router.get("/vendread-v-invoker", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-invoker", "vendread");
});
router.get("/vendread-v-yubel", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-yubel", "vendread");
});
router.get("/vendread-v-burn", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-burn", "vendread");
});
router.get("/vendread-v-cyber-end-dragon", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-cyber-end-dragon", "vendread");
});
router.get("/vendread-v-desperado-barrel-dragon", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-desperado-barrel-dragon", "vendread");
});
router.get("/vendread-v-dark-magician", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-dark-magician", "vendread");
});
router.get("/vendread-v-magnets", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vendreadDuel, "vendread-v-magnets", "vendread");
});

/* VAMPIRES */
router.get("/vampire-v-ancient-gears", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-ancient-gears", "vampire");
});
router.get("/vampire-v-fortune-ladies", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-fortune-ladies", "vampire");
});
router.get("/vampire-v-cerulean-sacred-phoenix", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-cerulean-sacred-phoenix", "vampire");
});
router.get("/vampire-v-burn", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-burn", "vampire");
});
router.get("/vampire-v-subterrors", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-subterrors", "vampire");
});
router.get("/vampire-v-magician-girls", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-magician-girls", "vampire");
});
router.get("/vampire-v-relinquished", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.vampireDuel, "vampire-v-relinquished", "vampire");
});

/* SACRED SOLDIER */
router.get("/sacred-soldier-v-silent-magician", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-silent-magician", "sacredsoldier");
});
router.get("/sacred-soldier-v-blue-eyes", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-blue-eyes", "sacredsoldier");
});
router.get("/sacred-soldier-ftk", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-ftk", "sacredsoldier");
});
router.get("/sacred-soldier-v-destiny-heroes", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-destiny-heroes", "sacredsoldier");
});
router.get("/sacred-soldier-v-noble-knights", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-noble-knights", "sacredsoldier");
});
router.get("/sacred-soldier-v-amazoness", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-amazoness", "sacredsoldier");
});
router.get("/sacred-soldier-v-masked-beast-des-gardius", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-v-masked-beast-des-gardius", "sacredsoldier");
});
router.get("/sacred-soldier-lava-golem-combo", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.sacredSoldierDuel, "sacred-soldier-lava-golem-combo", "sacredsoldier");
});

/* DINOS */
router.get("/dino-v-subterrors", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.dinoDuel, "dino-v-subterrors", "dino");
});
router.get("/dino-v-gravekeepers", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.dinoDuel, "dino-v-gravekeepers", "dino");
});
router.get("/dino-v-sartorius-desperado", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.dinoDuel, "dino-v-sartorius-desperado", "dino");
});

/* ARCHFIENDS */
router.get("/archfiend-v-evil-heroes", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.archfiendDuel, "archfiend-v-evil-heroe", "archfiend");
});
router.get("/archfiend-v-gladiator-beasts", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.archfiendDuel, "archfiend-v-gladiator-beasts", "archfiend");
});
router.get("/archfiend-v-dragons", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.archfiendDuel, "archfiend-v-dragons", "archfiend");
});

/* PSYCHICS */
router.get("/psychic-1", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.psychicDuel, "psychic-1", "psychic");
});
router.get("/psychic-2", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.psychicDuel, "psychic-2", "psychic");
});

/* AMAZON */
router.get("/amazon-mirror-match-1", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.amazonDuel, "amazon-mirror-match-1", "amazon");
});
router.get("/amazon-mirror-match-2", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.amazonDuel, "amazon-mirror-match-2", "amazon");
});
router.get("/amazon-v-anti-trap", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.amazonDuel, "amazon-v-anti-trap", "amazon");
});

/* ELEMENTSABERS */
router.get("/elementsaber-v-burn", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.elementsaberDuel, "elementsaber-v-burn", "elementsaber");
});

/* REZD */
router.get("/rezd-v-sylvans", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.redEyesZombieDuel, "rezd-v-sylvans", "rezd");
});
router.get("/rezd-v-armed-dragon", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.redEyesZombieDuel, "rezd-v-armed-dragon", "rezd");
});
router.get("/rezd-v-amazoness", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.redEyesZombieDuel, "rezd-v-amazoness", "rezd");
});

/* GEMINI */
router.get("/gemini-v-batteryman", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.geminiDuel, "gemini-v-batteryman", "gemini");
});

/* SPECIAL DUELS */
router.get("/dark-necrofear-special-duel-1", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.specialDuel, "dark-necrofear-special-duel-1", "specialduel");
});
router.get("/dark-necrofear-special-duel-2", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.specialDuel, "dark-necrofear-special-duel-2", "specialduel");
});

/* TURBO DUELS */
router.get("/td-elementsaber-v-lunalights", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.turboDuel, "td-elementsaber-v-lunalights", "turboduel");
});
router.get("/td-vendread-v-shiranui", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.turboDuel, "td-vendread-v-shiranui", "turboduel");
});

/* OTHER DUELS */
router.get("/bakura-otk", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.otherDuel, "bakura-otk", "otherduel");
});
router.get("/beast-warriors-v-six-samurai", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.otherDuel, "beast-warriors-v-six-samurai", "otherduel");
});
router.get("/constellar-v-bewd", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.otherDuel, "constellar-v-bewd", "otherduel");
});
router.get("/wiraqocha-rasca", function(req, res) {
    renderDuelVideoPage(req, res, DuelModel.otherDuel, "wiraqocha-rasca", "otherduel");
});

module.exports = router;
