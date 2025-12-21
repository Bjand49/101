using OneZeroOne.Core;
using OneZeroOne.Core.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var app = builder.Build();
var gameManager = new GameManager();


app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => "Hello World!");

//Game Endpoints
app.MapPost("/games", () =>
{
    var gameId = gameManager.CreateGame();
    return Results.Ok(new { GameId = gameId });
});

app.MapGet("/games/{gameId}", (Guid gameId) =>
{
    var game = gameManager.GetGame(gameId);
    if (game == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(game);
});
app.MapPost("/games/{gameId}/start", (Guid gameId) =>
{
    var game = gameManager.StartGame(gameId);
    if (game == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(game);
});
app.MapGet("/games", () =>
{
    var games = gameManager.GetGames();
    return Results.Ok(games);
});


// Player Interaction Endpoints
app.MapGet("/games/{gameId}/{playerId}/hand", (Guid gameId, Guid playerId) =>
{
    return Results.Ok(gameManager.GetGameHand(gameId, playerId));
});
app.MapPost("/games/{gameId}/{playerId}/hand/play", (Guid gameId, Guid playerId, Card card) =>
{
    return Results.Ok(gameManager.PlayCard(gameId, playerId, card));
});
app.MapPost("/games/{gameId}/player", (Guid gameId, string name) =>
{
    return Results.Ok(gameManager.AddPlayer(gameId, name));
});
app.MapPost("/games/{gameId}/{playerId}/hand/draw", (Guid gameId, Guid playerId, Guid? discardPilePlayer = null) =>
{
    return Results.Ok(gameManager.DrawCard(gameId, playerId));
});

app.Run();