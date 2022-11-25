const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("don't stop till u get enough");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getQuery = `
    SELECT player_id as playerId,
           player_name as playerName
    FROM player_details;  `;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
  console.log(dbResponse);
});

app.get("/players/:playerID/", async (request, response) => {
  const { playerID } = request.params;
  const sqlQuery = `
  SELECT player_id as playerId,
        player_name as playerName
  FROM player_details
  WHERE player_id = '${playerID}';  `;
  const dbResponse = await db.get(sqlQuery);
  response.send(dbResponse);
  console.log(dbResponse);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const sqlPutQuery = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = '${playerId}'    `;
  const dbResponse = await db.run(sqlPutQuery);
  response.send("Player Details Updated");
  console.log("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const sqlGetQuery = `
    SELECT match_id AS matchID,
           match,
           year 
    FROM match_details
    WHERE match_id = '${matchId}';    `;
  const dbResponse = await db.get(sqlGetQuery);
  response.send(dbResponse);
  console.log(dbResponse);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `
    SELECT match_id AS matchID,
           match,
           year 
    FROM player_details NATURAL JOIN match_details
    WHERE player_id = '${playerId}';    `;
  const dbResponse = await db.all(sqlQuery);
  response.send(dbResponse);
  console.log(dbResponse);
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  sqlGetQuery = `
    SELECT player_id as playerId,
           player_name as playerName 
    FROM player_details NATURAL JOIN player_match_score
    WHERE match_id = '${matchId}';    `;
  const dbResponse = await db.all(sqlGetQuery);
  response.send(dbResponse);
  console.log(dbResponse);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const sqlQuery = `
  SELECT 
        player_id as PlayerId,
        player_name as playerName,
         sum(score) as totalScore,
        sum(fours) as totalFours,
        sum(sixes) as totalSixes
  FROM player_match_score NATURAL JOIN player_details
  WHERE player_id = '${playerId}'
  GROUP BY player_id;  `;
  const dbResponse = await db.all(sqlQuery);
  response.send(dbResponse[0]);
  console.log(dbResponse[0]);
});

module.exports = app;
