# Normalize only known WiX-generated identifiers and summary timestamps, on copies.
param(
  [Parameter(Mandatory)][string] $First,
  [Parameter(Mandatory)][string] $Second,
  [Parameter(Mandatory)][string] $FirstWix,
  [Parameter(Mandatory)][string] $SecondWix,
  [Parameter(Mandatory)][string] $Scratch
)
$ErrorActionPreference = 'Stop'

if (-not ('DesktopMsiSummary' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.IO;
using System.Text;

public static class DesktopMsiSummary {
  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiGetSummaryInformation(uint database, string path, uint count, out uint summary);
  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiSummaryInfoGetProperty(uint summary, uint id, out uint type, out int number,
    out long time, StringBuilder text, ref uint length);
  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiSummaryInfoSetProperty(uint summary, uint id, uint type, int number,
    ref long time, string text);
  [DllImport("msi.dll")]
  private static extern uint MsiSummaryInfoPersist(uint summary);
  [DllImport("msi.dll")]
  private static extern uint MsiCloseHandle(uint handle);

  private static void Check(uint code) {
    if (code != 0) throw new InvalidOperationException("MSI summary API error " + code);
  }

  public static int ReplaceAscii(string file, string from, string to) {
    if (from.Length != to.Length || from.Length < 20)
      throw new ArgumentException("Expected fixed-length generated identifier");
    byte[] bytes = File.ReadAllBytes(file);
    byte[] before = Encoding.ASCII.GetBytes(from.ToUpperInvariant());
    byte[] after = Encoding.ASCII.GetBytes(to);
    int count = 0;
    for (int offset = 0; offset <= bytes.Length - before.Length; offset++) {
      int i = 0;
      while (i < before.Length) {
        byte c = bytes[offset + i];
        if (c >= 97 && c <= 122) c -= 32;
        if (c != before[i]) break;
        i++;
      }
      if (i != before.Length) continue;
      Buffer.BlockCopy(after, 0, bytes, offset, after.Length);
      count++;
      offset += before.Length - 1;
    }
    if (count > 0) File.WriteAllBytes(file, bytes);
    return count;
  }

  public static string[] Normalize(string file) {
    uint summary;
    Check(MsiGetSummaryInformation(0, file, 3, out summary));
    var values = new string[3];
    uint[] ids = new uint[] { 9, 12, 13 };
    try {
      for (int i = 0; i < ids.Length; i++) {
        uint id = ids[i], type, length = 2048;
        int number;
        long time;
        var text = new StringBuilder(2048);
        Check(MsiSummaryInfoGetProperty(summary, id, out type, out number, out time, text, ref length));
        if (id == 9) {
          Guid code;
          if (type != 30 || !Guid.TryParse(text.ToString(), out code))
            throw new InvalidOperationException("Invalid MSI PackageCode property");
          values[i] = code.ToString("B");
          Check(MsiSummaryInfoSetProperty(summary, id, type, 0, ref time,
            "{00000000-0000-0000-0000-000000000000}"));
        } else if (type == 64) {
          values[i] = DateTime.FromFileTimeUtc(time).ToString("O");
          long fixedTime = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc).ToFileTimeUtc();
          Check(MsiSummaryInfoSetProperty(summary, id, type, 0, ref fixedTime, null));
        } else if (type != 0) {
          throw new InvalidOperationException("Unexpected MSI summary timestamp type");
        }
      }
      Check(MsiSummaryInfoPersist(summary));
    } finally {
      MsiCloseHandle(summary);
    }
    return values;
  }
}
'@
}
if (Test-Path -LiteralPath $Scratch) { throw 'MSI comparison scratch path already exists' }
New-Item -ItemType Directory -Path $Scratch | Out-Null
$a = Join-Path $Scratch 'first.msi'
$b = Join-Path $Scratch 'second.msi'
Copy-Item -LiteralPath $First -Destination $a
Copy-Item -LiteralPath $Second -Destination $b
$before = [DesktopMsiSummary]::Normalize($a)
$after = [DesktopMsiSummary]::Normalize($b)
function ReadLoaderIdentity([string] $WixPath) {
  $raw = [IO.File]::ReadAllText($WixPath)
  [xml] $xml = $raw
  $loaded = @($xml.SelectNodes("//*[local-name()='Component']/*[local-name()='File' and contains(@Source, 'WebView2Loader.dll')]"))
  if ($loaded.Count -gt 1) { throw 'Unexpected multiple WebView2Loader components' }
  if ($loaded.Count -eq 0) { return @{ source = $raw; id = $null; guid = $null } }
  $id = $loaded[0].ParentNode.GetAttribute('Id')
  $guid = $loaded[0].ParentNode.GetAttribute('Guid')
  if ($id -notmatch '^I[a-f0-9]{32}$' -or $guid -notmatch '^[a-f0-9-]{36}$'
    -or $loaded[0].GetAttribute('Id') -cne "PathFile_$id") {
    throw 'Unexpected generated WiX WebView2Loader identifiers'
  }
  $fixedId = 'I' + ('0' * 32)
  $fixedGuid = '00000000-0000-0000-0000-000000000000'
  return @{ source = $raw.Replace($id, $fixedId).Replace($guid, $fixedGuid); id = $id; guid = $guid }
}
$left = ReadLoaderIdentity $FirstWix
$right = ReadLoaderIdentity $SecondWix
if ($left.source -cne $right.source) { throw 'Unexplained differences in generated WiX installer source' }
$loaderDifferences = @(foreach ($name in 'id', 'guid') {
  if ($left[$name] -ceq $right[$name]) { continue }
  if (!$left[$name] -or !$right[$name]) { throw 'WebView2Loader resource changed between builds' }
  $marker = if ($name -eq 'id') { 'I' + ('0' * 32) } else { '00000000-0000-0000-0000-000000000000' }
  $leftCount = [DesktopMsiSummary]::ReplaceAscii($a, $left[$name], $marker)
  $rightCount = [DesktopMsiSummary]::ReplaceAscii($b, $right[$name], $marker)
  if ($leftCount -eq 0 -or $leftCount -ne $rightCount) { throw 'Mismatched generated WiX identifiers in MSI bytes' }
  [ordered]@{ property = "WebView2Loader.$name"; first = $left[$name]; second = $right[$name]; occurrences = $leftCount }
})
$aSha = (Get-FileHash -LiteralPath $a -Algorithm SHA256).Hash.ToLowerInvariant()
$bSha = (Get-FileHash -LiteralPath $b -Algorithm SHA256).Hash.ToLowerInvariant()
if ($aSha -ne $bSha) { throw "Unexplained MSI rebuild differences after documented metadata normalization: $aSha $bSha" }
$labels = 'PackageCode', 'Created', 'LastSaved'
$differences = @(for ($i = 0; $i -lt $labels.Length; $i++) {
  if ($before[$i] -ne $after[$i]) {
    [ordered]@{ property = $labels[$i]; first = $before[$i]; second = $after[$i] }
  }
})
$differences += $loaderDifferences
if ($differences.Count -eq 0) { throw 'MSI bytes differed without a documented summary difference' }
[ordered]@{ normalizedSha256 = $aSha; fields = $differences }
