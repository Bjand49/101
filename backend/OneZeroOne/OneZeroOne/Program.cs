using Microsoft.AspNetCore.SignalR;
using Microsoft.Net.Http.Headers;
using OneZeroOne.Core;
using OneZeroOne.Core.Models;
using OneZeroOne.Web.Controllers;
using OneZeroOne.Web.SignalR;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Logging.AddSerilog();
builder.WebHost.UseUrls("http://0.0.0.0:5000");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameManager>();
builder.Services.AddSingleton<GameNotifier>();
builder.Services.AddSingleton<GameHub>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "*",
       policy =>
       {
           policy.SetIsOriginAllowed(origin =>
               {
                   var uri = new Uri(origin);
                   return true;
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
app.UseRouting();


app.RegisterSignalRRoutes();
app.RegisterGameRoutes();
app.RegisterManagerRoutes();





app.Run();