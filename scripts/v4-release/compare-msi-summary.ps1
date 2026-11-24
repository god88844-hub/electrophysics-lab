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
  [DllImport("msi.dll")]
  private static extern uint MsiCloseHandle(uint handle);

  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiOpenDatabase(string path, IntPtr mode, out uint database);
  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiDatabaseOpenView(uint database, string query, out uint view);
  [DllImport("msi.dll")]
  private static extern uint MsiViewExecute(uint view, uint record);
  [DllImport("msi.dll")]
  private static extern uint MsiViewFetch(uint view, out uint record);
  [DllImport("msi.dll", CharSet=CharSet.Unicode)]
  private static extern uint MsiRecordGetString(uint record, uint field, StringBuilder text, ref uint length);

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

  private static string ProductCode(string file) {
    uint database = 0, view = 0, record = 0;
    try {
      Check(MsiOpenDatabase(file, IntPtr.Zero, out database));
      Check(MsiDatabaseOpenView(database, "SELECT `Value` FROM `Property` WHERE `Property` = 'ProductCode'", out view));
      Check(MsiViewExecute(view, 0));
      Check(MsiViewFetch(view, out record));
      uint size = 128;
      var value = new StringBuilder(128);
      Check(MsiRecordGetString(record, 1, value, ref size));
      return Guid.Parse(value.ToString()).ToString("B");
    } finally {
      if (record != 0) MsiCloseHandle(record);
      if (view != 0) MsiCloseHandle(view);
      if (database != 0) MsiCloseHandle(database);
    }
  }

  // CFB's root directory entry is the first entry in the directory chain.
  // WiX writes its modified FILETIME without affecting streams or installer data.
  private static string NormalizeContainerTime(byte[] bytes) {
    int exponent = BitConverter.ToUInt16(bytes, 30);
    if (exponent != 9 && exponent != 12) throw new InvalidOperationException("Unexpected MSI CFB sector shift");
    long offset = (1L + BitConverter.ToUInt32(bytes, 48)) * (1 << exponent);
    if (offset > bytes.Length - 128) throw new InvalidOperationException("MSI root directory sector outside file");
    int root = (int)offset;
    if (bytes[root + 66] != 5 || Encoding.Unicode.GetString(bytes, root, 20) != "Root Entry")
      throw new InvalidOperationException("Missing MSI CFB root directory");
    long original = BitConverter.ToInt64(bytes, root + 108);
    if (original == 0) return null;
    Array.Clear(bytes, root + 108, 8);
    return DateTime.FromFileTimeUtc(original).ToString("O");
  }

  // Normalize only the DOS date/time words of known embedded cabinet members.
  // The cabinet contents, compression checksums and member names stay covered.
  private static string NormalizeCabinetTimes(byte[] bytes) {
    for (int i = 0; i <= bytes.Length - 36; i++) {
      if (bytes[i] != 77 || bytes[i+1] != 83 || bytes[i+2] != 67 || bytes[i+3] != 70) continue;
      uint relative = BitConverter.ToUInt32(bytes, i + 16);
      int count = BitConverter.ToUInt16(bytes, i + 28);
      if (relative < 36 || relative > 256 || count < 1 || count > 2) continue;
      int offset = i + (int)relative;
      var positions = new System.Collections.Generic.List<int>();
      var values = new System.Collections.Generic.List<string>();
      for (int member = 0; member < count && offset <= bytes.Length - 20; member++) {
        int last = Array.IndexOf<byte>(bytes, 0, offset + 16, Math.Min(48, bytes.Length - offset - 16));
        if (last < 0) break;
        string name = Encoding.ASCII.GetString(bytes, offset + 16, last - offset - 16);
        if (member == 0 ? name != "Path" : !System.Text.RegularExpressions.Regex.IsMatch(name, "^PathFile_I[a-fA-F0-9]{32}$"))
          break;
        positions.Add(offset + 10);
        values.Add((member == 0 ? "app" : "loader") + "=" + BitConverter.ToUInt32(bytes, offset + 10).ToString("x8"));
        offset = last + 1;
      }
      if (positions.Count != count) continue;
      foreach (int position in positions) Array.Clear(bytes, position, 4);
      return string.Join(",", values);
    }
    throw new InvalidOperationException("No cabinet with the documented Windows release members");
  }

  private static string NormalizeLoaderAlias(string file) {
    // WiX derives an 8.3 alias from the generated File identifier.
    string text = Encoding.Latin1.GetString(File.ReadAllBytes(file));
    var matches = System.Text.RegularExpressions.Regex.Matches(text,
      @"[a-zA-Z0-9_-]{8}\.dll[|]WebView2Loader\.dll");
    if (matches.Count == 0) return null;
    if (matches.Count != 1) throw new InvalidOperationException("Unexpected WiX loader alias count");
    string value = matches[0].Value;
    if (ReplaceAscii(file, value, "00000000.dll|WebView2Loader.dll") != 1)
      throw new InvalidOperationException("Invalid WiX loader short alias");
    return value;
  }

  private static int ReplaceTime(string file, long from) {
    byte[] bytes = File.ReadAllBytes(file);
    byte[] before = BitConverter.GetBytes(from);
    byte[] after = BitConverter.GetBytes(132223104000000000L);
    int count = 0;
    for (int offset = 0; offset <= bytes.Length - before.Length; offset++) {
      int i = 0;
      while (i < before.Length && bytes[offset + i] == before[i]) i++;
      if (i != before.Length) continue;
      Buffer.BlockCopy(after, 0, bytes, offset, after.Length);
      count++;
      offset += before.Length - 1;
    }
    if (count == 0 || count > 16) throw new InvalidOperationException("Unexpected MSI timestamp occurrences: " + count);
    File.WriteAllBytes(file, bytes);
    return count;
  }

  public static string[] Normalize(string file) {
    uint summary;
    Check(MsiGetSummaryInformation(0, file, 0, out summary));
    var values = new string[7];
    var timestamps = new System.Collections.Generic.HashSet<long>();
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
        } else if (type == 64) {
          values[i] = DateTime.FromFileTimeUtc(time).ToString("O");
          timestamps.Add(time);
        } else if (type != 0) {
          throw new InvalidOperationException("Unexpected MSI summary timestamp type");
        }
      }
    } finally {
      MsiCloseHandle(summary);
    }
    values[3] = ProductCode(file);
    byte[] bytes = File.ReadAllBytes(file);
    values[4] = NormalizeContainerTime(bytes);
    values[5] = NormalizeCabinetTimes(bytes);
    File.WriteAllBytes(file, bytes);
    values[6] = NormalizeLoaderAlias(file);
    if (ReplaceAscii(file, values[3], "{00000000-0000-0000-0000-000000000001}") != 1)
      throw new InvalidOperationException("Expected exactly one MSI ProductCode in bytes");
    if (ReplaceAscii(file, values[0], "{00000000-0000-0000-0000-000000000000}") != 1)
      throw new InvalidOperationException("Expected exactly one MSI PackageCode in bytes");
    foreach (long time in timestamps) ReplaceTime(file, time);
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
  if ($id -notmatch '^I[a-f0-9]{32}$' -or $guid -notmatch '^[a-f0-9-]{36}$' -or
     $loaded[0].GetAttribute('Id') -cne "PathFile_$id") {
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
$labels = 'PackageCode', 'Created', 'LastSaved', 'ProductCode', 'CFB.RootModified', 'Cabinet.MemberDosTimes', 'WebView2Loader.ShortAlias'
$differences = @(for ($i = 0; $i -lt $labels.Length; $i++) {
  if ($before[$i] -ne $after[$i]) {
    [ordered]@{ property = $labels[$i]; first = $before[$i]; second = $after[$i] }
  }
})
$differences += $loaderDifferences
if ($differences.Count -eq 0) { throw 'MSI bytes differed without a documented summary difference' }
[ordered]@{ normalizedSha256 = $aSha; fields = $differences }
