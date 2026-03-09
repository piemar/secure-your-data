#!/usr/bin/env node
/**
 * Test script: simulates /api/run-csharp (temp project + dotnet run).
 * Run from project root: node scripts/test-run-csharp.mjs
 * Use inside Docker to see the real dotnet error (e.g. ICU, SDK version).
 */
import { execFile, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const STEP1_CODE = `// STEP 1: Connect and Insert (InsertOne & InsertMany)
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var doc = new BsonDocument { { "name", "Widget" }, { "quantity", 10 }, { "tags", new BsonArray { "a", "b" } } };
coll.InsertOne(doc);
Console.WriteLine("Inserted id: " + doc["_id"]);
var docs = new List<BsonDocument> {
  new BsonDocument { { "name", "Gadget" }, { "quantity", 5 } },
  new BsonDocument { { "name", "Gizmo" }, { "quantity", 15 } }
};
coll.InsertMany(docs);
Console.WriteLine("insertMany insertedIds: " + System.Text.Json.JsonSerializer.Serialize(docs.Select(d => d["_id"].ToString()).ToList()));
`;

const CSPROJ = `<?xml version="1.0" encoding="utf-8"?>
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RootNamespace>LabRun</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="MongoDB.Driver" Version="2.28.0" />
  </ItemGroup>
</Project>
`;

function getDotnetPath() {
  try {
    const out = execSync('which dotnet', { encoding: 'utf8', env: process.env }).trim();
    if (out && fs.existsSync(out)) return out;
  } catch {}
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const candidates = [
    '/usr/share/dotnet/dotnet',
    '/usr/local/share/dotnet/dotnet',
    home ? path.join(home, '.dotnet', 'dotnet') : '',
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'dotnet';
}

function main() {
  const dotnetPath = getDotnetPath();
  const csharpDir = path.join(os.tmpdir(), `lab-csharp-test-${Date.now()}`);
  fs.mkdirSync(csharpDir, { recursive: true });
  fs.writeFileSync(path.join(csharpDir, 'Program.cs'), STEP1_CODE, 'utf8');
  fs.writeFileSync(path.join(csharpDir, 'LabRun.csproj'), CSPROJ, 'utf8');

  const env = { ...process.env, MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017' };
  console.log('Running: dotnet run in', csharpDir);
  console.log('MONGODB_URI:', env.MONGODB_URI ? '(set)' : '(not set)');
  console.log('---');

  execFile(
    dotnetPath,
    ['run'],
    { timeout: 60000, maxBuffer: 1024 * 1024, env, cwd: csharpDir },
    (err, stdout, stderr) => {
      try { fs.rmSync(csharpDir, { recursive: true }); } catch {}
      const code = err?.code ?? (err ? 1 : 0);
      if (stdout) console.log('STDOUT:\n' + stdout);
      if (stderr) console.error('STDERR:\n' + stderr);
      if (err && !stdout && !stderr) console.error('Error:', err.message);
      console.log('---\nExit code:', code);
      process.exit(code);
    }
  );
}

main();
