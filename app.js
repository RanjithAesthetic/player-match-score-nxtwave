const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, cricketMatchDetails.db);
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at htttp://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT player_id as playerId, player_name as playerName FROM player_details;`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const getPlayerQuery = `SELECT player_id as playerId, player_name as playerName FROM player_details WHERE player_id = '${playerId}';`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName } = details;
  const updatePlayerQuery = `UPDATE player_details  SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetails = `SELECT match_id as matchId FROM match_details WHERE match_id = '${matchId}';`;
  const matchDetails = await db.get(getMatchDetails);
  response.send(matchDetails);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerMatchQuery = `SELECT match_id as matchId, match , year FROM player_match_score NATURAL JOIN match_details WHERE player_id = '${playerId}';`;
  const playerMatchesArray = await db.all(getPlayerMatchQuery);
  response.send(playerMatchesArray);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getMatchPlayerQuery = `SELECT player_id as playerId, player_name as playerName FROM playerDetails INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE match_id = '${matchId}';`;
  const matchPlayer = await db.all(getPlayerMatchQuery);
  response.send(matchPlayer);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerScoreQuery = `SELECT player_details.player_id AS playerId, player_details.player_name AS playerName, SUM(player_match_score.score) AS totalScore, SUM(fours) AS totalFours , SUM(sixes) AS totalSixes FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE player_id = '${playerId}';`;
  const playerScores = await db.get(getPlayerScoreQuery);
  response.send(playerScores);
});

module.exports = app;
