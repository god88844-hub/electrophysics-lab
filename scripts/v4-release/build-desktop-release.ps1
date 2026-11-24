# Build twice from the same authenticated Phase 39 ZIP on Windows.
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string] $Repo,
  [Parameter(Mandatory)][string] $SourceDir,
  [Parameter(Mandatory)][string] $TargetDir,
  [Parameter(Mandatory)][string] $OutputDir,
  [string] $Toolchain = 'stable-x86_64-pc-windows-msvc',
  [string] $BaselineDir
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $IsWindows) { throw 'Use PowerShell 7 on Windows for the desktop release' }

function Run([string] $Program, [string[]] $Arguments) {
  & $Program @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Program failed with exit code $LASTEXITCODE" }
}

function ExternalPath([string] $Path) {
  $absolute = [IO.Path]::GetFullPath($Path)
  $rel = [IO.Path]::GetRelativePath($Repo, $absolute)
  if ($rel -ne '..' -and !$rel.StartsWith('..' + [IO.Path]::DirectorySeparatorChar) -and ![IO.Path]::IsPathRooted($rel)) {
    throw "Release paths must be outside the tracked checkout: $absolute"
  }
  $ancestor = $absolute
  while ($ancestor -and !(Test-Path -LiteralPath $ancestor)) { $ancestor = Split-Path -Parent $ancestor }
  for ($probe = $ancestor; $probe; $probe = Split-Path -Parent $probe) {
    if ((Get-Item -LiteralPath $probe -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
      throw "Release path uses a junction or symbolic link: $probe"
    }
  }
  return $absolute
}

$Repo = (Resolve-Path -LiteralPath $Repo).Path
$SourceDir = ExternalPath $SourceDir
$TargetDir = ExternalPath $TargetDir
$OutputDir = ExternalPath $OutputDir
if ($Toolchain -notin @('stable-x86_64-pc-windows-gnu', 'stable-x86_64-pc-windows-msvc')) {
  throw 'Select the supported x64 Windows GNU or MSVC stable toolchain'
}
if ($SourceDir -match '\s' -or $TargetDir -match '\s') {
  throw 'SourceDir and TargetDir must be space-free for Windows resource compilation'
}
$directories = @($SourceDir, $TargetDir, $OutputDir)
if (@($directories | Select-Object -Unique).Count -ne 3) { throw 'Release paths must be distinct' }
foreach ($left in $directories) {
  foreach ($right in $directories) {
    if ($left -ne $right -and $right.StartsWith($left.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
      throw 'Release source, Cargo target and artifact paths cannot contain one another'
    }
  }
}
if (Test-Path -LiteralPath $OutputDir) { throw "Use a new release output directory: $OutputDir" }
if (!$BaselineDir) { $BaselineDir = Join-Path $Repo 'benchmarks/evidence/phase39' }
$verifier = Join-Path $PSScriptRoot 'verify-desktop-release.mjs'
Run node @($verifier, 'prepare', '--repo', $Repo, '--baseline', $BaselineDir, '--source', $SourceDir)
New-Item -ItemType Directory -Path $OutputDir | Out-Null
$first = (New-Item -ItemType Directory -Path (Join-Path $OutputDir 'first')).FullName
$second = (New-Item -ItemType Directory -Path (Join-Path $OutputDir 'second')).FullName

$app = Join-Path $SourceDir 'apps/electrophysics-3d'
$env:CARGO_TARGET_DIR = $TargetDir
$env:RUSTUP_TOOLCHAIN = $Toolchain
$env:SOURCE_DATE_EPOCH = (& git -C $Repo show -s --format=%ct HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $env:SOURCE_DATE_EPOCH -notmatch '^\d+$') { throw 'Missing source commit date' }
$env:RUSTFLAGS = if ($Toolchain.EndsWith('-gnu')) {
  '-C link-arg=-Wl,--no-insert-timestamp'
} else {
  '-C link-arg=/Brepro'
}

$rootCargo = Join-Path $SourceDir 'Cargo.toml'
$heldCargo = Join-Path $SourceDir 'Cargo.kernel-workspace.toml'
if (Test-Path -LiteralPath $heldCargo) { throw 'A release source collides with Cargo workspace isolation' }
$originalCargoSha = (Get-FileHash -LiteralPath $rootCargo).Hash
# The ZIP contains two Cargo projects. Hide the unrelated kernel workspace
# manifest while Cargo discovers the standalone Tauri package.
Move-Item -LiteralPath $rootCargo -Destination $heldCargo
Push-Location $app
try {
  Run npm @('ci')

  function Build([string] $Directory) {
    Run cargo @('clean', '--release', '--manifest-path', 'src-tauri/Cargo.toml', '-p', 'electrophysics-lab')
    $config = Join-Path $SourceDir 'scripts/v4-release/tauri-release.json'
    Run npx @('--no-install', 'tauri', 'build', '--ci', '--no-sign', '--no-binary-patching', '--config', $config, '--', '--locked')
    $release = Join-Path $TargetDir 'release'
    $files = @(
      Get-Item -LiteralPath (Join-Path $release 'electrophysics-lab.exe')
      Get-ChildItem -LiteralPath (Join-Path $release 'bundle/nsis') -File -Filter '*_x64-setup.exe'
      Get-ChildItem -LiteralPath (Join-Path $release 'bundle/msi') -File -Filter '*_x64_en-US.msi'
    )
    if ($files.Count -ne 3) { throw 'Expected a fresh executable and exactly two installers' }
    foreach ($f in $files) { Copy-Item -LiteralPath $f.FullName -Destination $Directory }
    if ($Toolchain.EndsWith('-gnu')) {
      Copy-Item -LiteralPath (Join-Path $release 'WebView2Loader.dll') -Destination $Directory
    }
    Copy-Item -LiteralPath (Join-Path $release 'wix/x64/main.wxs') -Destination ($Directory + '.wxs')
    Copy-Item -LiteralPath (Join-Path $app 'dist') -Destination $Directory -Recurse
  }

  Build $first
  Build $second
} finally {
  Pop-Location
  Move-Item -LiteralPath $heldCargo -Destination $rootCargo
}
if ((Get-FileHash -LiteralPath $rootCargo).Hash -ne $originalCargoSha) {
  throw 'Extracted root workspace manifest was not restored byte-exactly'
}

Run node @($verifier, 'check-source', '--repo', $Repo, '--baseline', $BaselineDir, '--source', $SourceDir)

function FileSet([string] $Directory) {
  Get-ChildItem -LiteralPath $Directory -Recurse -File -Force | ForEach-Object {
    [pscustomobject]@{
      path = [IO.Path]::GetRelativePath($Directory, $_.FullName)
      sha256 = (Get-FileHash -LiteralPath $_.FullName).Hash.ToLowerInvariant()
      bytes = $_.Length
    }
  } | Sort-Object path -CaseSensitive
}
$a = @(FileSet $first)
$b = @(FileSet $second)
if ($a.Count -ne $b.Count) { throw 'Release rebuild file set differs' }
$deltas = @(for ($i = 0; $i -lt $a.Count; $i++) {
  if ($a[$i].path -cne $b[$i].path) { throw "Release rebuild file set differs at $i" }
  if ($a[$i].sha256 -eq $b[$i].sha256) { continue }
  if ($a[$i].path -notmatch '^Electrophysics Lab_.*\.msi$') {
    throw "Unexpected non-MSI rebuild delta: $($a[$i].path), $($a[$i].sha256) vs $($b[$i].sha256)"
  }
  $params = @{
    First = Join-Path $first $a[$i].path
    Second = Join-Path $second $b[$i].path
    FirstWix = $first + '.wxs'
    SecondWix = $second + '.wxs'
    Scratch = Join-Path $OutputDir 'msi-diagnostic'
  }
  $comparison = & (Join-Path $PSScriptRoot 'compare-msi-summary.ps1') @params
  [ordered]@{ path = $a[$i].path; first = $a[$i]; second = $b[$i]; summary = $comparison }
})
$rebuild = [ordered]@{
  result = if ($deltas.Count) { 'documented-wix-metadata-deltas' } else { 'byte-identical' }
  sourceDateEpoch = [long]$env:SOURCE_DATE_EPOCH
  filesCompared = $a.Count
  differences = $deltas
}
$rebuild | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $OutputDir 'desktop-rebuild-comparison.json') -Encoding utf8
$rebuild | ConvertTo-Json -Depth 8

Push-Location $app
try {
  Run npm @('run', 'desktop:smoke')
  Run node @((Join-Path $PSScriptRoot 'smoke-desktop-release.mjs'), $app, (Join-Path $first 'electrophysics-lab.exe'))
} finally {
  Pop-Location
}
$receipt = Join-Path $OutputDir 'desktop-release-receipt.json'
$receiptArgs = @('--repo', $Repo, '--baseline', $BaselineDir, '--artifacts', $first,
  '--frontend', (Join-Path $first 'dist'), '--receipt', $receipt)
Run node (@($verifier, 'record') + $receiptArgs)
Run node (@($verifier, 'verify') + $receiptArgs)
