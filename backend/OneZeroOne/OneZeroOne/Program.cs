using Microsoft.AspNetCore.SignalR;
using Microsoft.Net.Http.Headers;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;
using OneZeroOne.Web.Controllers;
using OneZeroOne.Web.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameManager>();
builder.Services.AddSingleton<GameNotifier>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "*",
       policy =>
       {
           policy.SetIsOriginAllowed(origin =>
               {
                   var uri = new Uri(origin);
                   return uri.Host == "localhost" || uri.Host == "127.0.0.1";
               })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
       });
});
var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("*");
app.MapGet("/", () => "Hello World!");

app.RegisterSignalRRoutes();
app.RegisterGameRoutes();
app.RegisterManagerRoutes();





app.Run();